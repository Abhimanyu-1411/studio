
'use server';

/**
 * @fileOverview This flow provides geocoding functionality.
 *
 * - geocodeAddress - A function that converts a textual address to geographic coordinates.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeAddressOutput - The return type for the geocodeAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {createClient} from '@/lib/supabase/server';

const GeocodeAddressInputSchema = z.object({
  address: z.string().describe('The full address line, if available.'),
  village: z.string().describe('The village name.'),
  tehsilTaluka: z.string().describe('The tehsil/taluka name.'),
  district: z.string().describe('The district name.'),
  state: z.string().describe('The state name.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
  lat: z.number().describe('The latitude of the address in EPSG:4326.'),
  lng: z.number().describe('The longitude of the address in EPSG:4326.'),
  confidenceScore: z.number().describe('A score from 0 to 1 indicating the confidence of the geocoding accuracy.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

export async function geocodeAddress(
  input: GeocodeAddressInput
): Promise<GeocodeAddressOutput> {
  // First, try to get a precise location
  const geocodeResult = await geocodeAddressFlow(input);
  
  // If confidence is low, fall back to village center
  if (geocodeResult.confidenceScore < 0.5) {
      const supabase = createClient();
      const { data: village } = await supabase
        .from('villages')
        .select('center')
        .eq('name', input.village)
        .single();
      
      if (village && village.center) {
        const center = village.center as {lat: number, lng: number};
        return {
            lat: center.lat,
            lng: center.lng,
            confidenceScore: 0.2 // Low confidence, as it's a fallback
        };
      }
  }
  
  return geocodeResult;
}

const prompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: {schema: GeocodeAddressInputSchema},
  output: {schema: GeocodeAddressOutputSchema},
  prompt: `You are an expert geocoding service like Nominatim or Google Maps. Your task is to convert a textual address into precise geographic coordinates (latitude and longitude) in EPSG:4326 format.

Use the standardized address format for the query: "{{address}}, {{village}}, {{tehsilTaluka}}, {{district}}, {{state}}, India".

It is crucial to use the village, tehsil/taluka, district, and state for accurate geographical context to avoid ambiguity.

Return the coordinates in JSON format, including a confidence score from 0.0 to 1.0 indicating how certain you are of the location's accuracy. A score of 1.0 means you are 100% confident. If the address is vague or lacks a specific landmark/Plus Code, provide the most likely coordinates with a lower confidence score.
`,
});

const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
