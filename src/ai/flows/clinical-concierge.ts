
'use server';
/**
 * @fileOverview A Genkit flow for the AI Clinical Concierge.
 * Provides science-backed answers and personalized product recommendations based on user biomarkers.
 *
 * - chatWithConcierge - The primary entry point for AI chat interactions.
 * - ClinicalChatInput - Input schema for conversation history, messages, and biological context.
 * - ClinicalChatOutput - Output schema for structured AI responses.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  price: z.number(),
});

/**
 * Tool to retrieve the current clinical catalog summary.
 * Used by the LLM to provide accurate product recommendations.
 */
const getClinicalCatalogTool = ai.defineTool(
  {
    name: 'getClinicalCatalog',
    description: 'Returns a summary of all available formulas and products in the Pharmlogics catalog.',
    inputSchema: z.void(),
    outputSchema: z.array(ProductSummarySchema),
  },
  async () => {
    // Standard clinical core formulas
    return [
      {
        id: 'prod_001',
        name: 'Omega-3 Fish Oil',
        category: 'Heart & Brain',
        description: 'High-potency Omega-3 for cardiovascular and cognitive health.',
        benefits: ['Heart Health', 'Brain Function', 'Inflammation Reduction'],
        price: 59.99
      },
      {
        id: 'prod_002',
        name: 'Vitamin D3 5000 IU',
        category: 'Bone & Immune',
        description: 'Essential for bone density and immune regulation.',
        benefits: ['Bone Strength', 'Immune Support', 'Mood Regulation'],
        price: 59.99
      },
      {
        id: 'prod_003',
        name: 'Probiotic Blend',
        category: 'Digestion',
        description: '50 billion CFUs for gut-brain axis support.',
        benefits: ['Gut Health', 'Digestion', 'Immunity'],
        price: 59.99
      },
      {
        id: 'prod_005',
        name: 'Magnesium Glycinate',
        category: 'Relaxation & Sleep',
        description: 'Chelated magnesium for deep REM sleep and muscle recovery.',
        benefits: ['Sleep Quality', 'Muscle Relaxation', 'Stress Support'],
        price: 59.99
      },
      {
        id: 'prod_006',
        name: 'Turmeric Curcumin',
        category: 'Joint Health',
        description: 'Advanced bioavailability for joint integrity.',
        benefits: ['Joint Pain Relief', 'Antioxidant', 'Anti-inflammatory'],
        price: 59.99
      }
    ];
  }
);

const ClinicalChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
  message: z.string().describe('The user\'s current question or statement.'),
  biomarkers: z.array(z.object({
    date: z.string(),
    metrics: z.object({
      focus: z.number(),
      energy: z.number(),
      sleep: z.number(),
      immunity: z.number(),
      recovery: z.number(),
    })
  })).optional().describe('Recent biological progress logs from the user.'),
});
export type ClinicalChatInput = z.infer<typeof ClinicalChatInputSchema>;

const ClinicalChatOutputSchema = z.object({
  response: z.string().describe('The AI response in clinical, helpful tone.'),
  suggestedProductIds: z.array(z.string()).optional().describe('IDs of products relevant to the answer.'),
});
export type ClinicalChatOutput = z.infer<typeof ClinicalChatOutputSchema>;

/**
 * Definition of the clinical concierge prompt template.
 * Uses Handlebars to inject conversation context, current user message, and biomarkers.
 */
const clinicalConciergePrompt = ai.definePrompt({
  name: 'clinicalConciergePrompt',
  input: { schema: ClinicalChatInputSchema },
  output: { schema: ClinicalChatOutputSchema },
  tools: [getClinicalCatalogTool],
  system: `You are the Senior Clinical AI Concierge at Pharmlogics Healthcare. 
Your goal is to provide high-integrity, science-backed information about our formulas and general biological optimization.

Guidelines:
1. TONALITY: Professional, clinical, precise, yet accessible. Avoid hype.
2. CATALOG: Always use the 'getClinicalCatalog' tool if the user asks about specific products or health goals.
3. CONTEXTUAL INTELLIGENCE: If 'biomarkers' are provided, analyze them for patterns. If any metric is below 5, acknowledge this data and explain how our formulas can specifically optimize that biomarker.
4. ADVICE: Do not give medical diagnoses. Always frame advice as "biological optimization research" or "nutritional protocols."
5. CITATIONS: If you mention a product, refer to its clinical name.
6. FORMAT: Return your response as a JSON object matching the ClinicalChatOutputSchema. Provide a 'response' string and an optional list of 'suggestedProductIds'.`,
  prompt: `
{{#if biomarkers}}
User's Recent Clinical Biomarkers (last 7 days):
{{#each biomarkers}}
- Date: {{date}}, Metrics: Focus={{metrics.focus}}, Energy={{metrics.energy}}, Sleep={{metrics.sleep}}, Immunity={{metrics.immunity}}, Recovery={{metrics.recovery}}
{{/each}}
{{/if}}

Conversation Context:
{{#each history}}
{{role}}: {{content}}
{{/each}}
User: {{message}}`,
});

/**
 * Encapsulated Genkit Flow for the Clinical Concierge chat.
 */
const chatWithConciergeFlow = ai.defineFlow(
  {
    name: 'chatWithConciergeFlow',
    inputSchema: ClinicalChatInputSchema,
    outputSchema: ClinicalChatOutputSchema,
  },
  async (input) => {
    const { output } = await clinicalConciergePrompt(input);
    if (!output) {
      throw new Error('AI failed to provide a clinical response node.');
    }
    return output;
  }
);

/**
 * Server Action to handle chat requests from the patient interface.
 */
export async function chatWithConcierge(input: ClinicalChatInput): Promise<ClinicalChatOutput> {
  return chatWithConciergeFlow(input);
}
