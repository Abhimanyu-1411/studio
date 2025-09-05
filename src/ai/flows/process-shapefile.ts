'use server';

/**
 * @fileOverview An AI agent to process shapefiles for patta data.
 *
 * - processShapefile - A function that extracts geospatial and attribute data from a shapefile.
 * - ProcessShapefileInput - The input type for the processShapefile function.
 * - ProcessShapefileOutput - The return type for the processShapefile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const PattaSchema = z.object({
    holderName: z.string().describe("The name of the patta holder."),
    villageName: z.string().describe("The name of the village."),
    geometry: z.array(LatLngSchema).describe("An array of latitude and longitude points forming the boundary of the patta land."),
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

export async function processShapefile(input: ProcessShapefileInput): Promise<ProcessShapefileOutput> {
  return processShapefileFlow(input);
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
4. Convert the extracted geometry into an array of latitude and longitude objects.
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
