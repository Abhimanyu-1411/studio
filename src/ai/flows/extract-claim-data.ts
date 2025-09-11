
'use server';

/**
 * @fileOverview An AI agent to extract claim data from documents.
 * This file is now using dummy data for demonstration purposes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { claims as allClaims } from '@/lib/data/claims';
import type { Claim } from '@/types';

const ExtractClaimDataInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The claim document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractClaimDataInput = z.infer<typeof ExtractClaimDataInputSchema>;

const FieldWithConfidenceSchema = z.object({
    raw: z.string().describe('The raw text extracted directly from the document without any cleaning or normalization.'),
    value: z.string().describe('The cleaned, standardized, and normalized value.'),
    confidence: z.number().min(0).max(1).describe('The confidence score of the extraction, from 0 to 1.'),
});

const ExtractClaimDataOutputSchema = z.object({
  claimantName: FieldWithConfidenceSchema.describe('The name of the claimant.'),
  pattaNumber: FieldWithConfidenceSchema.describe('The patta number of the claim.'),
  extentOfForestLandOccupied: FieldWithConfidenceSchema.describe('The extent of forest land occupied, in hectares.'),
  village: FieldWithConfidenceSchema.describe('The village where the claim is located.'),
  gramPanchayat: FieldWithConfidenceSchema.describe('The gram panchayat of the claim.'),
  tehsilTaluka: FieldWithConfidenceSchema.describe('The tehsil/taluka of the claim.'),
  district: FieldWithConfidenceSchema.describe('The district of the claim.'),
  state: FieldWithConfidenceSchema.describe('The state of the claim.'),
  date: FieldWithConfidenceSchema.describe('The date of the claim.'),
  claimType: FieldWithConfidenceSchema.describe('The type of claim (e.g., IFR, CFR).'),
  address: FieldWithConfidenceSchema.describe('The full address of the claimant.'),
  boundaries: FieldWithConfidenceSchema.describe('The descriptive boundaries (North, South, East, West landmarks).'),
});
export type ExtractClaimDataOutput = z.infer<typeof ExtractClaimDataOutputSchema>;

const firstClaim = allClaims[0];

// Convert the first raw claim from the data file into the format the AI flow expects.
const dummyClaimData: ExtractClaimDataOutput = {
    claimantName: { raw: firstClaim.claimantName, value: firstClaim.claimantName, confidence: 0.98 },
    pattaNumber: { raw: firstClaim.pattaNumber || '', value: firstClaim.pattaNumber || '', confidence: 0.95 },
    extentOfForestLandOccupied: { raw: firstClaim.landExtent || '', value: firstClaim.landExtent || '', confidence: 0.97 },
    village: { raw: firstClaim.villageName, value: firstClaim.villageName, confidence: 0.99 },
    gramPanchayat: { raw: firstClaim.gramPanchayat || '', value: firstClaim.gramPanchayat || '', confidence: 0.92 },
    tehsilTaluka: { raw: firstClaim.tehsilTaluka || '', value: firstClaim.tehsilTaluka || '', confidence: 0.93 },
    district: { raw: firstClaim.district || '', value: firstClaim.district || '', confidence: 0.96 },
    state: { raw: firstClaim.state || '', value: firstClaim.state || '', confidence: 0.99 },
    date: { raw: firstClaim.date || '', value: firstClaim.date || '', confidence: 0.98 },
    claimType: { raw: firstClaim.claimType, value: firstClaim.claimType, confidence: 0.97 },
    address: { raw: firstClaim.address || '', value: firstClaim.address || '', confidence: 0.94 },
    boundaries: { raw: firstClaim.boundaries || '', value: firstClaim.boundaries || '', confidence: 0.89 },
};


// Return dummy data instead of calling the AI flow
export async function extractClaimData(input: ExtractClaimDataInput): Promise<ExtractClaimDataOutput> {
  console.log("Simulating claim data extraction for:", input.documentDataUri.substring(0, 50) + "...");
  // You can add logic here to return different dummy data based on the input if needed
  return Promise.resolve(dummyClaimData);
}

// The original flow is kept below but is no longer called directly from the app actions.
const prompt = ai.definePrompt({
  name: 'extractClaimDataPrompt',
  input: {schema: ExtractClaimDataInputSchema},
  output: {schema: ExtractClaimDataOutputSchema},
  prompt: `You are an expert GIS analyst specializing in extracting information from Forest Rights Act (FRA) claim documents. OCR can be imperfect, so you must be able to handle common spelling variations.

Your task is to meticulously extract the following fields from the provided document. For each field, you must provide:
1.  \`raw\`: The text as it appears directly in the document.
2.  \`value\`: The cleaned, standardized, and normalized version of the text. For example, normalize spelling variations like "Baxa" to "Baksa".
3.  \`confidence\`: A confidence score from 0.0 to 1.0 indicating your certainty.

Here are the fields to extract:
- claimantName: The name of the claimant.
- pattaNumber: The patta number, if available.
- extentOfForestLandOccupied: The area of land, specified in hectares.
- village: The village name.
- gramPanchayat: The gram panchayat.
- tehsilTaluka: The tehsil or taluka.
- district: The district.
- state: The state.
- date: The date the claim was filed.
- claimType: The type of claim (IFR, CFR, CR).
- address: The full, complete address of the claimant. Standardize it to "Village, Tehsil, District, State, India".
- boundaries: The descriptive landmark boundaries for North, South, East, and West.

Here is the claim document: {{media url=documentDataUri}}

Return the data in the specified structured JSON format. Ensure all geographic data conforms to EPSG:4326 standards where applicable.`,
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
