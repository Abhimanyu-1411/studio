'use server';

/**
 * @fileOverview An AI agent to extract claim data from documents.
 *
 * - extractClaimData - A function that extracts data from claim documents.
 * - ExtractClaimDataInput - The input type for the extractClaimData function.
 * - ExtractClaimDataOutput - The return type for the extractClaimData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractClaimDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The claim document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractClaimDataInput = z.infer<typeof ExtractClaimDataInputSchema>;

const FieldWithConfidenceSchema = z.object({
    value: z.string(),
    confidence: z.number().min(0).max(1).describe('The confidence score of the extraction, from 0 to 1.'),
});

const ExtractClaimDataOutputSchema = z.object({
  claimantName: FieldWithConfidenceSchema.describe('The name of the claimant.'),
  pattaNumber: FieldWithConfidenceSchema.describe('The patta number of the claim.'),
  extentOfForestLandOccupied: FieldWithConfidenceSchema.describe('The extent of forest land occupied.'),
  village: FieldWithConfidenceSchema.describe('The village where the claim is located.'),
  gramPanchayat: FieldWithConfidenceSchema.describe('The gram panchayat of the claim.'),
  tehsilTaluka: FieldWithConfidenceSchema.describe('The tehsil/taluka of the claim.'),
  district: FieldWithConfidenceSchema.describe('The district of the claim.'),
  state: FieldWithConfidenceSchema.describe('The state of the claim.'),
  date: FieldWithConfidenceSchema.describe('The date of the claim.'),
  claimType: FieldWithConfidenceSchema.describe('The type of claim.'),
  address: FieldWithConfidenceSchema.describe('The full address of the claimant.'),
});
export type ExtractClaimDataOutput = z.infer<typeof ExtractClaimDataOutputSchema>;

export async function extractClaimData(input: ExtractClaimDataInput): Promise<ExtractClaimDataOutput> {
  return extractClaimDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractClaimDataPrompt',
  input: {schema: ExtractClaimDataInputSchema},
  output: {schema: ExtractClaimDataOutputSchema},
  prompt: `You are an expert in extracting information from claim documents.

You will receive a claim document and you will extract the following information in this specific order:
- claimantName: The name of the claimant.
- pattaNumber: The patta number associated with the claim.
- extentOfForestLandOccupied: The area of the claim, referred to as 'Extent of forest land occupied'.
- village: The village where the claim is located.
- gramPanchayat: The gram panchayat for the claim area.
- tehsilTaluka: The tehsil or taluka for the claim area.
- district: The district for the claim area.
- state: The state for the claim area.
- date: The date the claim was filed.
- claimType: The type of claim (e.g., IFR, CFR).
- address: The full address of the claimant.


For each field, provide the extracted value and a confidence score from 0.0 to 1.0 representing how certain you are about the accuracy of the extraction. A score of 1.0 means you are 100% confident.

Here is the claim document: {{media url=documentDataUri}}

Please provide the extracted information in JSON format.`,
});

const extractClaimDataFlow = ai.defineFlow(
  {
    name: 'extractClaimDataFlow',
    inputSchema: ExtractClaimDataInputSchema,
    outputSchema: ExtractClaimDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
