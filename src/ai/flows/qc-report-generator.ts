
'use server';
/**
 * @fileOverview A Genkit flow for generating Clinical QC Reports for Pharmlogics orders.
 *
 * - generateQCReport - A function that generates a laboratory audit report for an order.
 * - GenerateQCReportInput - Input schema for the order and products.
 * - GenerateQCReportOutput - Output schema for the structured lab report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQCReportInputSchema = z.object({
  orderId: z.string().describe('The clinical order ID.'),
  productNames: z.array(z.string()).describe('List of formulas in the order.'),
});
export type GenerateQCReportInput = z.infer<typeof GenerateQCReportInputSchema>;

const GenerateQCReportOutputSchema = z.object({
  batchId: z.string().describe('The laboratory batch identifier.'),
  verifiedAt: z.string().describe('The date of clinical verification.'),
  purityScore: z.number().describe('The percentage purity score (e.g., 99.8).'),
  reportText: z.string().describe('A detailed narrative report of the laboratory audit.'),
});
export type GenerateQCReportOutput = z.infer<typeof GenerateQCReportOutputSchema>;

export async function generateQCReport(input: GenerateQCReportInput): Promise<GenerateQCReportOutput> {
  return generateQCReportFlow(input);
}

const generateQCReportPrompt = ai.definePrompt({
  name: 'generateQCReportPrompt',
  input: { schema: GenerateQCReportInputSchema },
  output: { schema: GenerateQCReportOutputSchema },
  prompt: `You are a Senior Laboratory Director at Pharmlogics Healthcare. 
Your task is to generate a Quality Control (QC) Certificate for order '{{{orderId}}}' containing the following formulas: {{#each productNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Your report must sound professional, clinical, and high-integrity. 

Instructions:
1. Generate a Batch ID like 'PL-BATCH-XXXXX' where X is numeric.
2. Set a verification date (current or recent).
3. Assign a purity score between 99.4 and 99.9.
4. Write a 'reportText' narrative that mentions:
   - High-performance liquid chromatography (HPLC) verification.
   - Non-detectable levels of heavy metals (Lead, Mercury, Cadmium).
   - Bioavailability coefficient audit results.
   - Compliance with FDA cGMP standards.

The report should reassure the user that their specific allocation of formulas has passed rigorous biological standards.`,
});

const generateQCReportFlow = ai.defineFlow(
  {
    name: 'generateQCReportFlow',
    inputSchema: GenerateQCReportInputSchema,
    outputSchema: GenerateQCReportOutputSchema,
  },
  async (input) => {
    const { output } = await generateQCReportPrompt(input);
    return output!;
  }
);
