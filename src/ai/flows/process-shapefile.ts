
'use server';

/**
 * @fileOverview An AI agent to process shapefiles for patta data.
 * This file is now using dummy data for demonstration purposes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { pattas as dummyPattas } from '@/lib/data/pattas';
import type { LngLat } from '@/types';

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const PattaSchema = z.object({
    holderName: z.string().describe("The name of the patta holder."),
    villageName: z.string().describe("The name of the village."),
    geometry: z.array(z.array(z.number())).describe("An array of longitude and latitude points forming the boundary of the patta land."),
});

const ProcessShapefileInputSchema = z.object({
  shapefileDataUri: z
    .string()
    .describe(
      "The zipped shapefile data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/zip;base64,<encoded_data>'."
    ),
});
export type ProcessShapefileInput = z.infer<typeof ProcessShapefileInputSchema>;


const ProcessShapefileOutputSchema = z.array(PattaSchema);
export type ProcessShapefileOutput = z.infer<typeof ProcessShapefileOutputSchema>;

// Return dummy data instead of calling the AI flow
export async function processShapefile(input: ProcessShapefileInput): Promise<ProcessShapefileOutput> {
  console.log("Simulating shapefile processing...");
  // Return a couple of new dummy pattas to simulate a successful upload
  const newDummyPattas = dummyPattas.slice(0, 2).map(p => ({...p, holderName: `${p.holderName} (New)`}));
  return Promise.resolve(newDummyPattas);
}


const prompt = ai.definePrompt({
  name: 'processShapefilePrompt',
  input: {schema: ProcessShapefileInputSchema},
  output: {schema: ProcessShapefileOutputSchema},
  prompt: `You are an expert in geospatial data processing. You will receive a zipped shapefile as a data URI.

Your task is to:
1. Unzip and parse the shapefile (.shp, .shx, .dbf files).
2. For each feature in the shapefile, extract the boundary geometry (polygon).
3. From the attribute data (.dbf file), extract the name of the patta holder (look for fields like 'NAME', 'HOLDER', 'OWNER') and the village name (look for 'VILLAGE', 'GP_NAME').
4. Convert the extracted geometry into an array of longitude and latitude objects.
5. Return an array of Patta objects, with each object containing the holder's name, village name, and the geometry.

Here is the zipped shapefile: {{media url=shapefileDataUri}}

Please provide the extracted information in the specified JSON format.
`,
});

const processShapefileFlow = ai.defineFlow(
  {
    name: 'processShapefileFlow',
    inputSchema: ProcessShapefileInputSchema,
    outputSchema: ProcessShapefileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
