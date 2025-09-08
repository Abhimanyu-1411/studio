
'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { processShapefile } from '@/ai/flows/process-shapefile';
import { geocodeAddress } from '@/ai/flows/geocode-address';
import type { DssRecommendation, Claim, Village, CommunityAsset, TimeSeriesDataPoint, Patta } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleClaimUpload(documentDataUri: string, documentType: string) {
  const supabase = createClient();

  const extractedData = await extractClaimData({ documentDataUri });

  const locationResult = await geocodeAddress({
    address: extractedData.address.value,
    village: extractedData.village.value,
    district: extractedData.district.value,
    state: extractedData.state.value,
  });
  
  const allConfidences = [
      extractedData.claimantName.confidence,
      extractedData.pattaNumber.confidence,
      extractedData.extentOfForestLandOccupied.confidence,
      extractedData.village.confidence,
      extractedData.gramPanchayat.confidence,
      extractedData.tehsilTaluka.confidence,
      extractedData.district.confidence,
      extractedData.state.confidence,
      extractedData.date.confidence,
      extractedData.claimType.confidence,
      extractedData.address.confidence,
      locationResult.confidenceScore
  ];
  
  const lowestConfidence = Math.min(...allConfidences.map(c => c ?? 0));

  let status: Claim['status'] = 'linked';
  if (lowestConfidence < 0.8) {
      status = 'needs-review';
  }
  
  const newClaimData = {
    claimantName: extractedData.claimantName,
    pattaNumber: extractedData.pattaNumber,
    extentOfForestLandOccupied: extractedData.extentOfForestLandOccupied,
    village: extractedData.village,
    gramPanchayat: extractedData.gramPanchayat,
    tehsilTaluka: extractedData.tehsilTaluka,
    district: extractedData.district,
    state: extractedData.state,
    date: extractedData.date,
    claimType: extractedData.claimType,
    address: extractedData.address,
    documentUrl: documentDataUri,
    documentType: documentType,
    status: status,
    location: { lat: locationResult.lat, lng: locationResult.lng },
  };
  
  const { data, error } = await supabase.from('claims').insert(newClaimData).select().single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Failed to save the new claim to the database.");
  }

  revalidatePath('/');
  revalidatePath('/claims');
  
  return data as Claim;
}

export async function handleShapefileUpload(shapefileDataUri: string): Promise<Patta[]> {
  const supabase = createClient();
  const extractedPattas = await processShapefile({ shapefileDataUri });
  
  if (extractedPattas.length > 0) {
    const { data, error } = await supabase.from('pattas').insert(extractedPattas).select();
    if (error) {
        console.error("Supabase error inserting pattas:", error);
        throw new Error("Could not save patta data to the database.");
    }
     revalidatePath('/');
     return data as Patta[];
  }
  return [];
}


export async function updateClaim(claimId: string, updatedData: Partial<Claim>) {
    const supabase = createClient();
    
    const dataToUpdate = { ...updatedData };
    delete (dataToUpdate as Partial<Claim>).id;
    delete (dataToUpdate as Partial<Claim>).created_at;

    const { data, error } = await supabase
        .from('claims')
        .update(dataToUpdate)
        .eq('id', claimId);
        
    if (error) {
        console.error("Error updating claim:", error);
        throw new Error("Could not update the claim.");
    }
    revalidatePath('/');
    revalidatePath('/claims');
    return;
}

export async function deleteClaim(claimId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('claims').delete().eq('id', claimId);
    if (error) {
        console.error("Error deleting claim:", error);
        throw new Error("Could not delete the claim.");
    }
    revalidatePath('/');
    revalidatePath('/claims');
}

export async function deleteVillage(villageId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('villages').delete().eq('id', villageId);
    if (error) {
        console.error("Error deleting village:", error);
        throw new Error("Could not delete the village.");
    }
    revalidatePath('/');
    revalidatePath('/villages');
}


export async function getDssRecommendation(villageId: string): Promise<DssRecommendation[]> {
    const supabase = createClient();
    const { data: village, error: villageError } = await supabase.from('villages').select('*').eq('id', villageId).single();
    
    if (villageError || !village) {
        throw new Error("Village not found");
    }

    const { data: claimsInVillage, error: claimsError } = await supabase.from('claims').select('claimType, status, village').eq('village->>value', village.name);
    
    if(claimsError) {
        throw new Error("Could not fetch claims for village.");
    }

    const result = await dssRecommendations({
        villageName: village.name,
        claimCount: claimsInVillage.length,
        pendingClaims: claimsInVillage.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length,
        cfrClaims: claimsInVillage.filter(c => (c.claimType as any)?.value === 'CFR').length,
        ifrClaims: claimsInVillage.filter(c => (c.claimType as any)?.value === 'IFR').length,
        waterCoverage: (village.assetCoverage as any).water,
        forestCoverage: (village.assetCoverage as any).forest,
        agriculturalArea: (village.assetCoverage as any).agriculture,
    });

    return result.sort((a, b) => b.priority - a.priority);
}

export async function getPrediction(
    villageId: string,
    metric: keyof Omit<TimeSeriesDataPoint, 'date'>,
    forecastPeriods: number
): Promise<any[]> {
    const supabase = createClient();
    const { data: village, error } = await supabase.from('villages').select('timeSeriesData').eq('id', villageId).single();

    if (error || !village || !village.timeSeriesData) {
        throw new Error('Village or time-series data not found');
    }

    const timeSeriesData = village.timeSeriesData as TimeSeriesDataPoint[];

    const historicalData = timeSeriesData.map(d => ({
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
    const supabase = createClient();
    const { data, error } = await supabase.from('claims').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Error fetching claims:", error);
        return [];
    }
    return data as Claim[];
}

export async function getVillages(): Promise<Village[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('villages').select('*');
    if (error) {
        console.error("Error fetching villages:", error);
        return [];
    }
    return data as Village[];
}


export async function addCommunityAsset(asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> {
    const supabase = createClient();
    const { data, error } = await supabase.from('community_assets').insert(asset).select().single();
    if(error) {
        console.error("Error adding community asset:", error);
        throw new Error("Could not add community asset.");
    }
    revalidatePath('/assets');
    return data as CommunityAsset;
}

export async function getCommunityAssets(): Promise<CommunityAsset[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('community_assets').select('*');
    if(error) {
        console.error("Error fetching community assets:", error);
        return [];
    }
    return data as CommunityAsset[];
}

export async function getPattas(): Promise<Patta[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('pattas').select('*');
    if (error) {
        console.error("Error fetching pattas:", error);
        return [];
    }
    return data as Patta[];
}
