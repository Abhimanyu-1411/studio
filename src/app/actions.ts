
'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { processShapefile } from '@/ai/flows/process-shapefile';
import { geocodeAddress } from '@/ai/flows/geocode-address';
import { getVillageBoundary } from '@/ai/flows/get-village-boundary';
import type { DssRecommendation, Claim, Village, CommunityAsset, TimeSeriesDataPoint, Patta } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { point, polygon, booleanPointInPolygon } from '@turf/turf';

export async function handleClaimUpload(documentDataUri: string, documentType: string): Promise<Claim> {
  const supabase = createClient();

  // 1. Extract data from the document
  const extractedData = await extractClaimData({ documentDataUri });

  const villageName = extractedData.village.value;
  const districtName = extractedData.district.value;
  const stateName = extractedData.state.value;

  // 2. Get or create the village and fetch its boundary
  let { data: village } = await supabase.from('villages').select('id, bounds').eq('name', villageName).single();
  let villageBounds;

  if (village && village.bounds) {
    villageBounds = village.bounds;
  } else {
    const boundaryData = await getVillageBoundary({
      village: villageName,
      district: districtName,
      state: stateName,
    });
    
    const { data: newVillage, error: newVillageError } = await supabase.from('villages').insert({
      name: villageName,
      bounds: boundaryData.bounds,
      center: boundaryData.center,
      ndwi: 0,
      assetCoverage: { water: 0, forest: 0, agriculture: 0 }
    }).select('id, bounds').single();
    
    if (newVillageError) {
      console.error("Supabase insert new village error:", newVillageError);
      throw new Error("Failed to save the new village to the database.");
    }
    village = newVillage;
    villageBounds = newVillage.bounds;
  }
  
  // 3. Geocode the address to get a location point
  const locationResult = await geocodeAddress({
    address: extractedData.address.value,
    village: villageName,
    district: districtName,
    state: stateName,
  });

  // 4. Validate that the claim point is inside the village polygon
  let isLocationValid = false;
  if (locationResult && Array.isArray(villageBounds) && villageBounds.length > 2) {
    const claimPoint = point([locationResult.lng, locationResult.lat]);
    // Turf expects the first and last points to be the same to close the polygon
    const boundaryCoords = villageBounds.map(p => [p.lng, p.lat]);
    if (boundaryCoords.length > 0 && (boundaryCoords[0][0] !== boundaryCoords[boundaryCoords.length - 1][0] || boundaryCoords[0][1] !== boundaryCoords[boundaryCoords.length - 1][1])) {
        boundaryCoords.push(boundaryCoords[0]);
    }
    const villagePolygon = polygon([boundaryCoords]);
    isLocationValid = booleanPointInPolygon(claimPoint, villagePolygon);
  }

  // 5. Determine status based on confidence and validation
  const allConfidences = [
    extractedData.claimantName.confidence,
    extractedData.pattaNumber.confidence,
    extractedData.village.confidence,
    extractedData.district.confidence,
    extractedData.state.confidence,
    locationResult.confidenceScore
  ].map(c => c ?? 0);
  
  const lowestConfidence = Math.min(...allConfidences);
  
  let status: Claim['status'] = 'unlinked';
  if (lowestConfidence < 0.8 || !isLocationValid) {
    status = 'needs-review';
  }

  // 6. Insert the new claim
  const newClaimData = {
    claimantName: extractedData.claimantName.value,
    pattaNumber: extractedData.pattaNumber.value,
    extentOfForestLandOccupied: extractedData.extentOfForestLandOccupied.value,
    village: extractedData.village.value,
    gramPanchayat: extractedData.gramPanchayat.value,
    tehsilTaluka: extractedData.tehsilTaluka.value,
    district: extractedData.district.value,
    state: extractedData.state.value,
    date: extractedData.date.value,
    claimType: extractedData.claimType.value,
    address: extractedData.address.value,
    documentUrl: documentDataUri,
    documentType: documentType,
    status: status,
    location: { lat: locationResult.lat, lng: locationResult.lng },
    confidenceScores: {
      claimantName: extractedData.claimantName.confidence,
      pattaNumber: extractedData.pattaNumber.confidence,
      extentOfForestLandOccupied: extractedData.extentOfForestLandOccupied.confidence,
      village: extractedData.village.confidence,
      gramPanchayat: extractedData.gramPanchayat.confidence,
      tehsilTaluka: extractedData.tehsilTaluka.confidence,
      district: extractedData.district.confidence,
      state: extractedData.state.confidence,
      date: extractedData.date.confidence,
      claimType: extractedData.claimType.confidence,
      address: extractedData.address.confidence,
      location: locationResult.confidenceScore
    }
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
    // These fields should not be updated.
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

    const { data: claimsInVillage, error: claimsError } = await supabase.from('claims').select('claimType, status, village').eq('village', village.name);
    
    if(claimsError) {
        throw new Error("Could not fetch claims for village.");
    }

    const result = await dssRecommendations({
        villageName: village.name,
        claimCount: claimsInVillage.length,
        pendingClaims: claimsInVillage.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length,
        cfrClaims: claimsInVillage.filter(c => c.claimType === 'CFR').length,
        ifrClaims: claimsInVillage.filter(c => c.claimType === 'IFR').length,
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

    