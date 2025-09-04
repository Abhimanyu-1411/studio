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
  pendingClaims: z.number().describe('The number of pending claims.'),
  cfrClaims: z.number().describe('The number of Community Forest Right (CFR) claims.'),
  ifrClaims: z.number().describe('The number of Individual Forest Right (IFR) claims.'),
  waterCoverage: z.number().describe('The percentage of water body coverage in the village.'),
  forestCoverage: z.number().describe('The percentage of forest cover in the village.'),
  agriculturalArea: z.number().describe('The percentage of agricultural area in the village.'),
});
export type DSSRecommendationsInput = z.infer<typeof DSSRecommendationsInputSchema>;

const DSSRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('The recommended action with a priority score.'),
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
  prompt: `You are an expert in providing recommendations for village development schemes based on geospatial and claim data.

  Based on the following information, provide a recommendation and a justification for it.

  Village Name: {{{villageName}}}
  Total Claims: {{{claimCount}}}
  Pending Claims: {{{pendingClaims}}}
  CFR Claims: {{{cfrClaims}}}
  IFR Claims: {{{ifrClaims}}}
  Water Coverage: {{{waterCoverage}}}%
  Forest Coverage: {{{forestCoverage}}}%
  Agricultural Area: {{{agriculturalArea}}}%

  Consider the following rules when providing a recommendation, including the priority score in the recommendation text:
  - IF water_coverage < 30% AND total_claims > 5 THEN recommend "JJM Borewell Program" (priority: 8)
  - IF forest_coverage > 60% AND cfr_claims > 0 THEN recommend "Community Forest Management Scheme" (priority: 7)
  - IF agricultural_area > 40% AND ifr_claims > 3 THEN recommend "PM-KISAN Direct Benefit Transfer" (priority: 6)
  - IF total_claims > 10 AND pending_claims > 5 THEN recommend "Fast Track FRA Processing" (priority: 9)
  - IF water_coverage < 20% THEN recommend "MGNREGA Water Conservation Works" (priority: 7)

  Provide a concise recommendation and a clear justification. Pick the highest priority recommendation if multiple rules match.
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
