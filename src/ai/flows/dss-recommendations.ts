'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing DSS recommendations based on claim data and asset overlays.
 *
 * The flow takes claim data and asset information as input and returns a recommendation with a justification.
 * - dssRecommendations - A function that generates DSS recommendations.
 * - DSSRecommendationsInput - The input type for the dssRecommendations function.
 * - DSSRecommendationsOutput - The return type for the dssRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DSSRecommendationsInputSchema = z.object({
  villageName: z.string().describe('The name of the village.'),
  claimCount: z.number().describe('The number of claims in the village.'),
  ndwi: z.number().describe('The Normalized Difference Water Index for the village.'),
  claimType: z.string().describe('The type of claim being made.'),
});
export type DSSRecommendationsInput = z.infer<typeof DSSRecommendationsInputSchema>;

const DSSRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('The recommended action.'),
  justification: z.string().describe('The justification for the recommendation.'),
});
export type DSSRecommendationsOutput = z.infer<typeof DSSRecommendationsOutputSchema>;

export async function dssRecommendations(input: DSSRecommendationsInput): Promise<DSSRecommendationsOutput> {
  return dssRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dssRecommendationsPrompt',
  input: {schema: DSSRecommendationsInputSchema},
  output: {schema: DSSRecommendationsOutputSchema},
  prompt: `You are an expert in providing recommendations based on claim data and asset overlays.

  Based on the following information, provide a recommendation and a justification for the recommendation.

  Village Name: {{{villageName}}}
  Claim Count: {{{claimCount}}}
  NDWI: {{{ndwi}}}
  Claim Type: {{{claimType}}}

  Consider the following rules when providing a recommendation:
  - IF NDWI is low AND claim count is high, THEN recommend JJM Borewell.
  - IF NDWI is high AND claim count is low, THEN recommend water conservation efforts.
  - IF claim type is related to land disputes, THEN recommend land survey and resolution.

  Provide a concise recommendation and a clear justification.
  `,
});

const dssRecommendationsFlow = ai.defineFlow(
  {
    name: 'dssRecommendationsFlow',
    inputSchema: DSSRecommendationsInputSchema,
    outputSchema: DSSRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
