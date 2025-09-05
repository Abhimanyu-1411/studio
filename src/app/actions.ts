
'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { intelligentGeoLinking } from '@/ai/flows/intelligent-geo-linking';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { processShapefile } from '@/ai/flows/process-shapefile';
import { MOCK_CLAIMS, VILLAGES, AVAILABLE_VILLAGE_NAMES } from '@/lib/mock-data';
import type { DssRecommendation, Claim, Village, CommunityAsset, TimeSeriesDataPoint, Patta } from '@/types';


export async function handleClaimUpload(documentDataUri: string) {
  const extractedData = await extractClaimData({ documentDataUri });

  const geoLinkResult = await intelligentGeoLinking({
    claimVillageName: extractedData.village.value,
    availableVillageNames: AVAILABLE_VILLAGE_NAMES,
  });
  
  const allConfidences = [
      extractedData.claimantName.confidence,
      extractedData.village.confidence,
      extractedData.claimType.confidence,
      extractedData.area.confidence,
      extractedData.date.confidence,
      geoLinkResult.confidenceScore
  ];
  
  const lowestConfidence = Math.min(...allConfidences);

  let status: Claim['status'] = 'linked';
  if (!geoLinkResult.linkedVillageName || lowestConfidence < 0.8) {
      status = 'needs-review';
  }

  const randomLocation = {
      lat: 26.5 + (Math.random() - 0.5) * 0.5,
      lng: 82.4 + (Math.random() - 0.5) * 0.8
  };
  
  const newClaimData: Omit<Claim, 'id'> = {
    ...extractedData,
    village: extractedData.village, // Keep the object with value and confidence
    linkedVillage: geoLinkResult.linkedVillageName,
    geoLinkConfidence: geoLinkResult.confidenceScore,
    status,
    location: randomLocation,
    documentUrl: '', // This will be handled separately if we store docs in Firebase Storage
    documentType: '', // Ditto
  };
  
  const newClaim = { id: `claim-${Date.now()}`, ...newClaimData };

  return newClaim;
}

export async function handleShapefileUpload(shapefileDataUri: string): Promise<Patta[]> {
  const extractedPattas = await processShapefile({ shapefileDataUri });
  // In a real app, you would save this to the database.
  // For now, we just return it to the client to be displayed.
  // We'll add an ID to each patta for use as a key in React.
  return extractedPattas.map((patta, index) => ({
    ...patta,
    id: `patta-${Date.now()}-${index}`,
  }));
}


export async function updateClaim(claimId: string, updatedData: Partial<Claim>) {
    // This is a mock implementation. In a real app, you would update the database.
    console.log(`Updating claim ${claimId} with`, updatedData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
}

export async function getDssRecommendation(villageId: string): Promise<DssRecommendation[]> {
    const village = VILLAGES.find(v => v.id === villageId);
    if (!village) {
        throw new Error("Village not found");
    }

    const claimsInVillage = MOCK_CLAIMS.filter(c => c.linkedVillage === village.name);

    const result = await dssRecommendations({
        villageName: village.name,
        claimCount: claimsInVillage.length,
        pendingClaims: claimsInVillage.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length,
        cfrClaims: claimsInVillage.filter(c => c.claimType.value === 'CFR').length,
        ifrClaims: claimsInVillage.filter(c => c.claimType.value === 'IFR').length,
        waterCoverage: village.assetCoverage.water,
        forestCoverage: village.assetCoverage.forest,
        agriculturalArea: village.assetCoverage.agriculture,
    });

    return result.sort((a, b) => b.priority - a.priority);
}

export async function getPrediction(
    villageId: string,
    metric: keyof Omit<TimeSeriesDataPoint, 'date'>,
    forecastPeriods: number
): Promise<any[]> {
    const village = VILLAGES.find(v => v.id === villageId);
    if (!village || !village.timeSeriesData) {
        throw new Error('Village or time-series data not found');
    }

    const historicalData = village.timeSeriesData.map(d => ({
        date: d.date,
        value: d[metric]
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
    // Simulate fetching from a database
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CLAIMS;
}

export async function getVillages(): Promise<Village[]> {
    // Simulate fetching from a database
    await new Promise(resolve => setTimeout(resolve, 300));
    return VILLAGES;
}

let mockCommunityAssets: CommunityAsset[] = [];

export async function addCommunityAsset(asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> {
    const newAsset = { id: `asset-${Date.now()}`, ...asset };
    mockCommunityAssets.push(newAsset);
    return newAsset;
}

export async function getCommunityAssets(): Promise<CommunityAsset[]> {
    return mockCommunityAssets;
}

// NOTE: This is a mock seeding action.
export async function seedInitialData() {
    console.log("Using mock data. No seeding necessary.");
    return { success: true, message: "Using mock data." };
}
