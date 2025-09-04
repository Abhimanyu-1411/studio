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

const ExtractClaimDataOutputSchema = z.object({
  claimantName: z.string().describe('The name of the claimant.'),
  village: z.string().describe('The village where the claim is located.'),
  claimType: z.string().describe('The type of claim.'),
  area: z.string().describe('The area of the claim.'),
  date: z.string().describe('The date of the claim.'),
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

You will receive a claim document and you will extract the following information:
- claimantName: The name of the claimant.
- village: The village where the claim is located.
- claimType: The type of claim.
- area: The area of the claim.
- date: The date of the claim.

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
