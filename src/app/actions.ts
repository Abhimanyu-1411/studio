
'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { processShapefile } from '@/ai/flows/process-shapefile';
import { geocodeAddress } from '@/ai/flows/geocode-address';
import { getVillageBoundary } from '@/ai/flows/get-village-boundary';
import type { DssRecommendation, Claim, Village, CommunityAsset, TimeSeriesDataPoint, Patta } from '@/types';
// import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dummyClaims, dummyVillages, dummyAssets, dummyPattas } from '@/lib/dummy-data';

// =================================================================================
// THIS FILE NOW USES DUMMY DATA INSTEAD OF A LIVE DATABASE CONNECTION.
// All functions have been modified to work with in-memory data arrays.
// =================================================================================

let claimsStore: Claim[] = [...dummyClaims];
let villagesStore: Village[] = [...dummyVillages];
let assetsStore: CommunityAsset[] = [...dummyAssets];
let pattasStore: Patta[] = [...dummyPattas];

export async function handleClaimUpload(documentDataUri: string, documentType: string): Promise<Claim> {

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
    is_location_valid: true, // Assume valid for dummy data
  };

  claimsStore.unshift(newClaim);
  revalidatePath('/');
  revalidatePath('/claims');
  
  return newClaim;
}

export async function handleShapefileUpload(shapefileDataUri: string): Promise<Patta[]> {
  const newPattas = await processShapefile({ shapefileDataUri });
  
  pattasStore.push(...newPattas);
  revalidatePath('/');
  return newPattas;
}


export async function updateClaim(claimId: string, updatedData: Partial<Claim>) {
    const index = claimsStore.findIndex(c => c.id === claimId);
    if (index !== -1) {
        claimsStore[index] = { ...claimsStore[index], ...updatedData };
    }
    revalidatePath('/');
    revalidatePath('/claims');
    return claimsStore[index];
}

export async function deleteClaim(claimId: string) {
    claimsStore = claimsStore.filter(c => c.id !== claimId);
    revalidatePath('/');
    revalidatePath('/claims');
}

export async function deleteVillage(villageId: string) {
    villagesStore = villagesStore.filter(v => v.id !== villageId);
    revalidatePath('/');
    revalidatePath('/villages');
}


export async function getDssRecommendation(villageId: string): Promise<DssRecommendation[]> {
    const village = villagesStore.find(v => v.id === villageId);
    if (!village) throw new Error("Village not found");

    const claimsInVillage = claimsStore.filter(c => c.village.value === village.name);
    
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
}

export async function getPrediction(
    villageId: string,
    metric: keyof Omit<TimeSeriesDataPoint, 'date'>,
    forecastPeriods: number
): Promise<any[]> {
    const village = villagesStore.find(v => v.id === villageId);
    if (!village || !village.timeSeriesData) {
        throw new Error('Village or time-series data not found');
    }

    const timeSeriesData = village.timeSeriesData as TimeSeriesDataPoint[];

    const historicalData = timeSeriesData.map(d => ({
        date: d.date,
        value: d[metric] as number
    }));

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
}

export async function getClaims(): Promise<Claim[]> {
    return claimsStore;
}

export async function getVillages(): Promise<Village[]> {
    return villagesStore;
}


export async function addCommunityAsset(asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> {
    const newAsset: CommunityAsset = {
        ...asset,
        id: `asset_${Date.now()}`
    };
    assetsStore.unshift(newAsset);
    revalidatePath('/assets');
    return newAsset;
}

export async function getCommunityAssets(): Promise<CommunityAsset[]> {
    return assetsStore;
}

export async function getPattas(): Promise<Patta[]> {
    return pattasStore;
}
