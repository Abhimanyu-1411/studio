'use server';

/**
 * @fileOverview This flow provides village boundary data.
 *
 * - getVillageBoundary - A function that returns the geospatial boundary for a given village.
 * - GetVillageBoundaryInput - The input type for the getVillageBoundary function.
 * - GetVillageBoundaryOutput - The return type for the getVillageBoundary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const GetVillageBoundaryInputSchema = z.object({
  village: z.string().describe('The village name.'),
  district: z.string().describe('The district name.'),
  state: z.string().describe('The state name.'),
});
export type GetVillageBoundaryInput = z.infer<typeof GetVillageBoundaryInputSchema>;

const GetVillageBoundaryOutputSchema = z.object({
  bounds: z.array(LatLngSchema).describe('An array of latitude and longitude points forming the boundary of the village.'),
  center: LatLngSchema.describe('The center point of the village.'),
});
export type GetVillageBoundaryOutput = z.infer<typeof GetVillageBoundaryOutputSchema>;

export async function getVillageBoundary(
  input: GetVillageBoundaryInput
): Promise<GetVillageBoundaryOutput> {
  return getVillageBoundaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVillageBoundaryPrompt',
  input: {schema: GetVillageBoundaryInputSchema},
  output: {schema: GetVillageBoundaryOutputSchema},
  prompt: `You are an expert geospatial information service. Your task is to provide the administrative boundary polygon and the center coordinates for a given village.

Village: {{{village}}}
District: {{{district}}}
State: {{{state}}}

Based on this information, find the official administrative boundary for the village. Return the boundary as an array of latitude and longitude points, and also provide the central latitude and longitude of the village.

Return the information in the specified JSON format.
`,
});

const getVillageBoundaryFlow = ai.defineFlow(
  {
    name: 'getVillageBoundaryFlow',
    inputSchema: GetVillageBoundaryInputSchema,
    outputSchema: GetVillageBoundaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
