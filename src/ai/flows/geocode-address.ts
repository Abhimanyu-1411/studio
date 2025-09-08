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

const GeocodeAddressInputSchema = z.object({
  address: z.string().describe('The full address line, if available.'),
  village: z.string().describe('The village name.'),
  district: z.string().describe('The district name.'),
  state: z.string().describe('The state name.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
  lat: z.number().describe('The latitude of the address.'),
  lng: z.number().describe('The longitude of the address.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

export async function geocodeAddress(
  input: GeocodeAddressInput
): Promise<GeocodeAddressOutput> {
  return geocodeAddressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: {schema: GeocodeAddressInputSchema},
  output: {schema: GeocodeAddressOutputSchema},
  prompt: `You are an expert geocoding service. Based on the provided address information, determine the precise latitude and longitude.

Address: {{{address}}}
Village: {{{village}}}
District: {{{district}}}
State: {{{state}}}

Return the coordinates in JSON format.
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
