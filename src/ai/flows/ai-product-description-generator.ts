'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating engaging product descriptions for supplements.
 *
 * - generateProductDescription - A function that generates a product description based on product details.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the supplement product.'),
  ingredients: z.string().describe('A comma-separated list of key ingredients in the supplement.'),
  benefits: z.string().describe('A comma-separated list of the primary benefits of the supplement.'),
  targetAudience: z.string().describe('The intended target audience for the supplement.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated engaging and informative product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const generateProductDescriptionPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are a skilled copywriter specializing in health and wellness products for a company named Pharmlogics Healthcare.
Your task is to create an engaging and informative product description for a new supplement.

Product Name: {{{productName}}}
Ingredients: {{{ingredients}}}
Key Benefits: {{{benefits}}}
Target Audience: {{{targetAudience}}}

Craft a compelling, professional, and persuasive description that highlights the key benefits, explains the important ingredients, and resonates specifically with the identified target audience. The description should be suitable for a product catalog and encourage purchase. Focus on natural wellness and health benefits.
Do not include a title or any introductory/concluding remarks outside of the description itself.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateProductDescriptionPrompt(input);
    return output!;
  }
);
