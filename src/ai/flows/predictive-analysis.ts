'use server';

/**
 * @fileOverview This file defines a Genkit flow for predictive analysis of time-series data.
 *
 * The flow takes historical data and predicts future trends.
 * - predictiveAnalysis - A function that performs time-series forecasting.
 * - PredictiveAnalysisInput - The input type for the predictiveAnalysis function.
 * - PredictiveAnalysisOutput - The return type for the predictiveAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimePointSchema = z.object({
  date: z.string().describe('The date of the data point in YYYY-MM-DD format.'),
  value: z.number().describe('The numeric value of the data point.'),
});

const PredictiveAnalysisInputSchema = z.object({
  metricName: z.string().describe("The name of the metric being analyzed (e.g., 'Rainfall', 'NDWI')."),
  historicalData: z.array(TimePointSchema).describe('An array of historical data points.'),
  forecastPeriods: z.number().describe('The number of future periods to forecast.'),
});
export type PredictiveAnalysisInput = z.infer<typeof PredictiveAnalysisInputSchema>;

const PredictiveAnalysisOutputSchema = z.array(TimePointSchema);
export type PredictiveAnalysisOutput = z.infer<typeof PredictiveAnalysisOutputSchema>;

export async function predictiveAnalysis(input: PredictiveAnalysisInput): Promise<PredictiveAnalysisOutput> {
  return predictiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnalysisPrompt',
  input: {schema: PredictiveAnalysisInputSchema},
  output: {schema: PredictiveAnalysisOutputSchema},
  prompt: `You are a data scientist specializing in time-series forecasting. Analyze the provided historical data for the metric "{{metricName}}" to identify trends, seasonality, and other patterns.

Historical Data:
{{#each historicalData}}
- Date: {{date}}, Value: {{value}}
{{/each}}

Based on your analysis, please forecast the values for the next {{forecastPeriods}} periods. Provide the output as a structured array of data points with dates and predicted values. The dates should continue sequentially from the last historical data point.

Provide the forecast in JSON format.
`,
});

const predictiveAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveAnalysisFlow',
    inputSchema: PredictiveAnalysisInputSchema,
    outputSchema: PredictiveAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
