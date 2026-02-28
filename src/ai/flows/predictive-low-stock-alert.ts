'use server';
/**
 * @fileOverview A Genkit flow for predicting low stock alerts for supplements.
 *
 * - predictiveLowStockAlert - A function that triggers a low stock alert based on inventory levels and sales trends.
 * - PredictiveLowStockAlertInput - The input type for the predictiveLowStockAlert function.
 * - PredictiveLowStockAlertOutput - The return type for the predictiveLowStockAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveLowStockAlertInputSchema = z.object({
  productName: z.string().describe('The name of the supplement product.'),
  currentStock: z.number().min(0).describe('The current number of units in stock.'),
  salesHistory: z.array(z.number().min(0)).min(1).describe('An array of daily sales quantities for recent days (e.g., last 7 days).'),
  reorderLeadTimeDays: z.number().min(0).describe('The number of days it takes for new stock to arrive after reordering.'),
  desiredSafetyStockDays: z.number().min(0).describe('The number of days of average sales to keep as a safety buffer.'),
});
export type PredictiveLowStockAlertInput = z.infer<typeof PredictiveLowStockAlertInputSchema>;

const PredictiveLowStockAlertOutputSchema = z.object({
  isLowStock: z.boolean().describe('True if the product is critically low on stock, false otherwise.'),
  alertMessage: z.string().describe('A detailed message explaining the stock status and recommendations.'),
  recommendedReorderQuantity: z.number().nullable().describe('Recommended quantity to reorder if stock is low, otherwise null.'),
  estimatedDaysUntilStockout: z.number().nullable().describe('Estimated number of days until current stock runs out, otherwise null.'),
});
export type PredictiveLowStockAlertOutput = z.infer<typeof PredictiveLowStockAlertOutputSchema>;

// Define a tool for calculating stock metrics to ensure numerical accuracy.
const calculateStockMetricsTool = ai.defineTool(
  {
    name: 'calculateStockMetrics',
    description: 'Calculates key stock metrics like average daily sales, estimated days until stockout, reorder point, and safety stock quantity based on provided inventory data.',
    inputSchema: z.object({
      currentStock: z.number().describe('The current number of units in stock.'),
      salesHistory: z.array(z.number()).describe('An array of daily sales quantities for recent days.'),
      reorderLeadTimeDays: z.number().describe('The number of days it takes for new stock to arrive after reordering.'),
      desiredSafetyStockDays: z.number().describe('The number of days of average sales to keep as a safety buffer.'),
    }),
    outputSchema: z.object({
      averageDailySales: z.number().describe('The calculated average daily sales based on sales history.'),
      estimatedDaysUntilStockout: z.number().describe('The estimated number of days until current stock runs out.'),
      reorderPoint: z.number().describe('The stock level at which a reorder should be placed (demand during lead time + safety stock).'),
      demandDuringLeadTime: z.number().describe('The expected demand during the reorder lead time.'),
      safetyStockQuantity: z.number().describe('The quantity representing the desired safety stock.'),
    }),
  },
  async (input) => {
    if (input.salesHistory.length === 0) {
      // This case should not be reached due to salesHistory.min(1) in the input schema.
      // However, as a safeguard, return default values.
      return {
        averageDailySales: 0,
        estimatedDaysUntilStockout: Infinity,
        reorderPoint: 0,
        demandDuringLeadTime: 0,
        safetyStockQuantity: 0,
      };
    }
    const totalSales = input.salesHistory.reduce((sum, sales) => sum + sales, 0);
    const averageDailySales = totalSales / input.salesHistory.length;

    const estimatedDaysUntilStockout = averageDailySales > 0
      ? input.currentStock / averageDailySales
      : Infinity;

    const demandDuringLeadTime = averageDailySales * input.reorderLeadTimeDays;
    const safetyStockQuantity = averageDailySales * input.desiredSafetyStockDays;
    // Round up reorder point to ensure enough stock is accounted for.
    const reorderPoint = Math.ceil(demandDuringLeadTime + safetyStockQuantity);

    return {
      averageDailySales: parseFloat(averageDailySales.toFixed(2)),
      estimatedDaysUntilStockout: parseFloat(estimatedDaysUntilStockout.toFixed(2)),
      reorderPoint,
      demandDuringLeadTime: parseFloat(demandDuringLeadTime.toFixed(2)),
      safetyStockQuantity: parseFloat(safetyStockQuantity.toFixed(2)),
    };
  }
);

const predictiveLowStockAlertPrompt = ai.definePrompt({
  name: 'predictiveLowStockAlertPrompt',
  input: { schema: PredictiveLowStockAlertInputSchema },
  output: { schema: PredictiveLowStockAlertOutputSchema },
  tools: [calculateStockMetricsTool],
  prompt: `You are an expert inventory management assistant for Pharmlogics Healthcare. Your task is to analyze supplement stock levels for '{{{productName}}}' and determine if it's critically low, then recommend a reorder quantity.

Here's the data for product '{{{productName}}}':
Current Stock: {{{currentStock}}} units
Recent Daily Sales (units sold per day for the last ${PredictiveLowStockAlertInputSchema.shape.salesHistory.description?.match(/last (\d+) days/)?.[1] || 'recent'} days): {{{salesHistory}}}
Reorder Lead Time: {{{reorderLeadTimeDays}}} days
Desired Safety Stock: {{{desiredSafetyStockDays}}} days worth of average sales.

**Instructions:**
1.  **Crucially, you must first call the \`calculateStockMetrics\` tool** with the \`currentStock\`, \`salesHistory\`, \`reorderLeadTimeDays\`, and \`desiredSafetyStockDays\` to get accurate stock metrics.
2.  Based on the output from the tool, determine if the product '{{{productName}}}' is critically low on stock.
    A product is considered **critically low** if its \`currentStock\` is **less than** the \`reorderPoint\` calculated by the tool.
3.  If \`isLowStock\` is true:
    a.  Calculate the \`recommendedReorderQuantity\`. This should be the quantity needed to bring the current stock up to a comfortable level, considering the reorder point and lead time. A good heuristic is to order enough to reach the \`reorderPoint\` (from the tool's output) plus an additional quantity to cover \`7\` days of average sales (from the tool's output) as an extra buffer (i.e., \`Math.max(0, {{calculateStockMetrics.reorderPoint}} - {{currentStock}}) + ({{calculateStockMetrics.averageDailySales}} * 7)\`). Ensure the recommended quantity is a positive integer, rounding up if necessary.
    b.  The \`estimatedDaysUntilStockout\` should come directly from the \`estimatedDaysUntilStockout\` field of the tool's output.
4.  If \`isLowStock\` is false:
    a.  \`recommendedReorderQuantity\` should be \`null\`.
    b.  \`estimatedDaysUntilStockout\` should be \`null\`.
5.  Generate a comprehensive \`alertMessage\` that clearly explains the stock status, the reasoning behind the low stock determination (or why it's not low), and the recommendation (if applicable).

Provide your final response as a JSON object that strictly adheres to the \`PredictiveLowStockAlertOutputSchema\`.

`,
});


const predictiveLowStockAlertFlow = ai.defineFlow(
  {
    name: 'predictiveLowStockAlertFlow',
    inputSchema: PredictiveLowStockAlertInputSchema,
    outputSchema: PredictiveLowStockAlertOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveLowStockAlertPrompt(input);
    return output!;
  }
);

export async function predictiveLowStockAlert(
  input: PredictiveLowStockAlertInput
): Promise<PredictiveLowStockAlertOutput> {
  return predictiveLowStockAlertFlow(input);
}
