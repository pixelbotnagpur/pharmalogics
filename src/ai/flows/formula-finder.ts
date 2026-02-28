'use server';
/**
 * @fileOverview A Genkit flow for recommending supplement protocols based on user profiles.
 *
 * - findOptimizationProtocol - Analyzes user health data and recommends products.
 * - FormulaFinderInput - Input schema for the quiz data.
 * - FormulaFinderOutput - Output schema for the personalized recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FormulaFinderInputSchema = z.object({
  primaryGoal: z.string().describe('The user\'s primary health goal (e.g., Focus, Vitality, Immunity).'),
  lifestyle: z.string().describe('Description of their daily activity level and stressors.'),
  concerns: z.array(z.string()).describe('List of specific physiological concerns (e.g., Joint pain, Sleep quality).'),
  dietaryPreferences: z.string().describe('Vegan, gluten-free, or no preference.'),
});
export type FormulaFinderInput = z.infer<typeof FormulaFinderInputSchema>;

const FormulaFinderOutputSchema = z.object({
  protocolName: z.string().describe('A clinical name for the recommended protocol.'),
  summary: z.string().describe('A brief explanation of why this protocol fits their profile.'),
  recommendations: z.array(z.object({
    productId: z.string().describe('The ID of the recommended product.'),
    reasoning: z.string().describe('Specific biological reason for this recommendation.'),
    priority: z.enum(['Essential', 'Optimizing', 'Supportive']),
  })).describe('List of recommended products with reasoning.'),
  lifestyleAdvice: z.string().describe('A piece of actionable clinical advice for their specific profile.'),
});
export type FormulaFinderOutput = z.infer<typeof FormulaFinderOutputSchema>;

export async function findOptimizationProtocol(input: FormulaFinderInput): Promise<FormulaFinderOutput> {
  return findOptimizationProtocolFlow(input);
}

const findOptimizationProtocolPrompt = ai.definePrompt({
  name: 'findOptimizationProtocolPrompt',
  input: { schema: FormulaFinderInputSchema },
  output: { schema: FormulaFinderOutputSchema },
  prompt: `You are a Senior Clinical Nutritionist at Pharmlogics Healthcare. 
Your task is to analyze a user's biological profile and health goals to recommend a personalized Optimization Protocol using our clinical-grade supplements.

User Profile:
Primary Goal: {{{primaryGoal}}}
Lifestyle: {{{lifestyle}}}
Concerns: {{#each concerns}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Dietary: {{{dietaryPreferences}}}

Available Formulas in our Catalog:
- prod_001: Omega-3 Fish Oil (Heart & Brain, Inflammation)
- prod_002: Vitamin D3 5000 IU (Bone, Immune, Mood)
- prod_003: Probiotic Blend (Digestion, Gut-Brain Axis)
- prod_004: Multivitamin Complex (General Wellness, Energy)
- prod_005: Magnesium Glycinate (Relaxation, Sleep, Muscle)
- prod_006: Turmeric Curcumin (Joint Health, Anti-inflammatory)

Instructions:
1. Select 2-3 formulas that most directly address the user's Primary Goal and Concerns.
2. Provide a 'Protocol Name' that sounds clinical and professional (e.g., 'Cognitive Resilience Protocol').
3. For each recommendation, provide a specific biological reason tied to their input.
4. Ensure the 'summary' explains the synergy between the selected products.
5. Provide one expert lifestyle tip.

Strictly return a JSON object matching the FormulaFinderOutputSchema.`,
});

const findOptimizationProtocolFlow = ai.defineFlow(
  {
    name: 'findOptimizationProtocolFlow',
    inputSchema: FormulaFinderInputSchema,
    outputSchema: FormulaFinderOutputSchema,
  },
  async (input) => {
    const { output } = await findOptimizationProtocolPrompt(input);
    return output!;
  }
);
