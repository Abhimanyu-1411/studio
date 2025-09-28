
'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { processShapefile } from '@/ai/flows/process-shapefile';
import { geocodeAddress } from '@/ai/flows/geocode-address';
import type { DssRecommendation, Claim, Village, CommunityAsset, TimeSeriesDataPoint, Patta, LngLat } from '@/types';
import { revalidatePath } from 'next/cache';
import { dataStore } from '@/lib/data-loader';

// =================================================================================
// This file now uses a singleton data store that holds validated in-memory data.
// =================================================================================

const createField = <T extends string | number>(value: T) => ({
    raw: String(value),
    value: value,
    confidence: 1.0, 
});

const handleAIApiError = (error: any) => {
    console.error('AI API Error:', error);
    // Check for specific error messages related to service availability
    const errorMessage = error.message || '';
    if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
        throw new Error('503: AI service is currently overloaded. Please try again later.');
    }
    // For other errors, re-throw the original error
    throw error;
}

export async function handleClaimUpload(documentDataUri: string, documentType: string): Promise<Claim> {
  try {
    // Simulate AI data extraction
    const extractedData = await extractClaimData({ documentDataUri });

    // Simulate geocoding
    const locationResult = await geocodeAddress({
      address: extractedData.address.value,
      village: extractedData.village.value,
      tehsilTaluka: extractedData.tehsilTaluka.value,
      district: extractedData.district.value,
      state: extractedData.state.value,
    });

    const newClaim: Claim = {
      id: `claim_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...extractedData,
      documentUrl: documentDataUri,
      documentType: documentType,
      status: 'needs-review',
      location: {
          value: { lat: locationResult.lat, lng: locationResult.lng },
          confidence: locationResult.confidenceScore
      },
      is_location_valid: true, // Assume valid for new uploads for now
    };

    await dataStore.addClaim(newClaim);
    revalidatePath('/');
    revalidatePath('/claims');
    
    return newClaim;
  } catch (error) {
      handleAIApiError(error);
      // This line will only be reached if the error is not a 503 error
      throw new Error('Failed to handle claim upload due to an unexpected error.');
  }
}

export async function handleShapefileUpload(shapefileDataUri: string): Promise<Patta[]> {
  const newPattas = await processShapefile({ shapefileDataUri });
  
  await dataStore.addPattas(newPattas);
  revalidatePath('/');
  return newPattas;
}

export async function updateClaim(claimId: string, updatedData: Partial<Claim>) {
    const updated = await dataStore.updateClaim(claimId, updatedData);
    revalidatePath('/');
    revalidatePath('/claims');
    return updated;
}

export async function deleteClaim(claimId: string) {
    await dataStore.deleteClaim(claimId);
    revalidatePath('/');
    revalidatePath('/claims');
}

export async function deleteVillage(villageId: string) {
    await dataStore.deleteVillage(villageId);
    revalidatePath('/');
    revalidatePath('/villages');
}


export async function getDssRecommendation(villageId: string): Promise<DssRecommendation[]> {
    const villages = await dataStore.getVillages();
    const claims = await dataStore.getClaims();

    const village = villages.find(v => v.id === villageId);
    if (!village) throw new Error("Village not found");

    const claimsInVillage = claims.filter(c => c.village.value === village.name);
    
    try {
        return dssRecommendations({
            villageName: village.name,
            claimCount: claimsInVillage.length,
            pendingClaims: claimsInVillage.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length,
            cfrClaims: claimsInVillage.filter(c => c.claimType.value === 'CFR').length,
            ifrClaims: claimsInVillage.filter(c => c.claimType.value === 'IFR').length,
            waterCoverage: village.assetCoverage.water,
            forestCoverage: village.assetCoverage.forest,
            agriculturalArea: village.assetCoverage.agriculture,
        });
    } catch (error) {
        handleAIApiError(error);
        throw new Error('Failed to get DSS recommendations due to an unexpected error.');
    }
}

export async function getPrediction(
    villageId: string,
    metric: keyof Omit<TimeSeriesDataPoint, 'date'>,
    forecastPeriods: number
): Promise<any[]> {
    const villages = await dataStore.getVillages();
    const village = villages.find(v => v.id === villageId);
    if (!village || !village.timeSeriesData) {
        throw new Error('Village or time-series data not found');
    }

    const timeSeriesData = village.timeSeriesData as TimeSeriesDataPoint[];

    const historicalData = timeSeriesData.map(d => ({
        date: d.date,
        value: d[metric] as number
    }));

    try {
        const forecast = await predictiveAnalysis({
            metricName: metric,
            historicalData,
            forecastPeriods,
        });
        
        const formattedHistoricalData = historicalData.map(d => ({
            date: d.date,
            historical: d.value,
            predicted: null,
        }));
        
        const formattedForecastData = forecast.map(d => ({
            date: d.date,
            historical: null,
            predicted: d.value,
        }));

        return [...formattedHistoricalData, ...formattedForecastData];
    } catch (error) {
        handleAIApiError(error);
        throw new Error('Failed to get prediction due to an unexpected error.');
    }
}

export async function getClaims(): Promise<Claim[]> {
    return dataStore.getClaims();
}

export async function getVillages(): Promise<Village[]> {
    return dataStore.getVillages();
}


export async function addCommunityAsset(asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> {
    const newAsset = await dataStore.addAsset(asset);
    revalidatePath('/assets');
    return newAsset;
}

export async function getCommunityAssets(): Promise<CommunityAsset[]> {
    return dataStore.getCommunityAssets();
}

export async function getPattas(): Promise<Patta[]> {
    return dataStore.getPattas();
}
