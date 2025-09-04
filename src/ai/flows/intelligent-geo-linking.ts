'use server';

/**
 * @fileOverview This flow intelligently links claims to village polygons based on fuzzy matching of names, with a manual selection override.
 *
 * - intelligentGeoLinking - A function that handles the geo-linking process.
 * - IntelligentGeoLinkingInput - The input type for the intelligentGeoLinking function.
 * - IntelligentGeoLinkingOutput - The return type for the intelligentGeoLinking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentGeoLinkingInputSchema = z.object({
  claimVillageName: z
    .string()
    .describe('The village name extracted from the claim.'),
  availableVillageNames: z
    .array(z.string())
    .describe('A list of available village names in the district.'),
});
export type IntelligentGeoLinkingInput = z.infer<
  typeof IntelligentGeoLinkingInputSchema
>;

const IntelligentGeoLinkingOutputSchema = z.object({
  linkedVillageName: z
    .string()
    .describe(
      'The best matched village name from the available village names, or an empty string if no match is found.'
    ),
  confidenceScore: z
    .number()
    .describe(
      'A score indicating the confidence of the match (0 to 1), or 0 if no match is found.'
    ),
});
export type IntelligentGeoLinkingOutput = z.infer<
  typeof IntelligentGeoLinkingOutputSchema
>;

export async function intelligentGeoLinking(
  input: IntelligentGeoLinkingInput
): Promise<IntelligentGeoLinkingOutput> {
  return intelligentGeoLinkingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentGeoLinkingPrompt',
  input: {schema: IntelligentGeoLinkingInputSchema},
  output: {schema: IntelligentGeoLinkingOutputSchema},
  prompt: `You are an expert in geospatial data linking. Given a claim village name and a list of available village names, determine the best match.

Claim Village Name: {{{claimVillageName}}}
Available Village Names: {{#each availableVillageNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return the best matched village name and a confidence score between 0 and 1. If no good match is found, return an empty string for the village name and 0 for the confidence score.

Consider minor spelling variations and abbreviations when assessing the best match, but do not invent village names that do not exist in the list of available village names.

Output should be in JSON format.
`,
});

const intelligentGeoLinkingFlow = ai.defineFlow(
  {
    name: 'intelligentGeoLinkingFlow',
    inputSchema: IntelligentGeoLinkingInputSchema,
    outputSchema: IntelligentGeoLinkingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
