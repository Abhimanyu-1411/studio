'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { intelligentGeoLinking } from '@/ai/flows/intelligent-geo-linking';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { AVAILABLE_VILLAGE_NAMES, VILLAGES } from '@/lib/mock-data';
import type { DssRecommendation, Claim, Village, TimeSeriesDataPoint } from '@/types';

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
  
  const newClaim: Omit<Claim, 'id' | 'documentUrl' | 'documentType'> = {
    ...extractedData,
    village: extractedData.village, // Keep the object with value and confidence
    linkedVillage: geoLinkResult.linkedVillageName,
    geoLinkConfidence: geoLinkResult.confidenceScore,
    status,
    location: randomLocation
  };

  return newClaim;
}

export async function getDssRecommendation(villageId: string, claims: Claim[]): Promise<DssRecommendation[]> {
    const village = VILLAGES.find(v => v.id === villageId);
    if (!village) {
        throw new Error("Village not found");
    }

    const claimsInVillage = claims.filter(c => c.linkedVillage === village.name);

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
