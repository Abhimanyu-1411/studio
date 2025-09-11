
'use server';

/**
 * @fileOverview This file defines a rules-based engine for providing DSS recommendations based on claim data.
 *
 * This has been updated to use a deterministic rules engine instead of a Genkit AI flow.
 * - dssRecommendations - A function that generates DSS recommendations.
 * - DSSRecommendationsInput - The input type for the dssRecommendations function.
 * - DSSRecommendationsOutput - The return type for the dssRecommendations function.
 */

import { z } from 'genkit';
import { dssRules } from '@/lib/dss-rules';
import type { DSSRecommendationsInput, DSSRecommendationsOutput } from '@/types/index';

// The schema definitions remain the same for type safety.
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

const RecommendationSchema = z.object({
  recommendation: z.string().describe('The recommended action.'),
  justification: z.string().describe('The justification for the recommendation.'),
  priority: z.number().describe('A priority score for the recommendation.'),
});

const DSSRecommendationsOutputSchema = z.array(RecommendationSchema);


/**
 * Generates DSS recommendations based on a set of deterministic rules.
 * @param input The village data to be evaluated.
 * @returns A promise that resolves to an array of recommendations.
 */
export async function dssRecommendations(input: DSSRecommendationsInput): Promise<DSSRecommendationsOutput> {
  // Validate input against the Zod schema to ensure data integrity.
  DSSRecommendationsInputSchema.parse(input);

  const recommendations = dssRules
    .filter(rule => rule.criteria(input))
    .map(rule => ({
      recommendation: rule.name,
      justification: rule.justification,
      priority: rule.priority,
    }))
    .sort((a, b) => b.priority - a.priority);
  
  return Promise.resolve(recommendations);
}
