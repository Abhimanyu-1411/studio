import { config } from 'dotenv';
config();

import '@/ai/flows/extract-claim-data.ts';
import '@/ai/flows/dss-recommendations.ts';
import '@/ai/flows/predictive-analysis.ts';
import '@/ai/flows/process-shapefile.ts';
import '@/ai/flows/geocode-address.ts';
import '@/ai/flows/get-village-boundary.ts';
