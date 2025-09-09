
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
  bounds: z.array(z.array(LatLngSchema)).describe('An array of polygons, where each polygon is an array of latitude and longitude points forming a village boundary. A village can have multiple discontinuous polygons.'),
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
  prompt: `You are an expert geospatial information service. Your task is to provide the administrative boundary polygon(s) and the center coordinates for a given village.

It is crucial to use the full address hierarchy to find the correct village: {{{village}}}, {{{district}}}, {{{state}}}, India.

Based on this information, find the official administrative boundary for the village. A village may consist of multiple, non-contiguous polygons. Return all polygons associated with the village. The polygons should be high-resolution and detailed.

Return the boundary as an array of polygons, where each polygon is an array of latitude and longitude points in EPSG:4326 format. Also provide the central latitude and longitude of the overall village area.

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
