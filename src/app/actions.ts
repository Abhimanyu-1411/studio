
'use server';

import { collection, addDoc, getDocs, doc, updateDoc, query, where, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { intelligentGeoLinking } from '@/ai/flows/intelligent-geo-linking';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { predictiveAnalysis } from '@/ai/flows/predictive-analysis';
import { MOCK_CLAIMS, VILLAGES } from '@/lib/mock-data';
import type { DssRecommendation, Claim, Village, TimeSeriesDataPoint } from '@/types';


export async function handleClaimUpload(documentDataUri: string) {
  const extractedData = await extractClaimData({ documentDataUri });

  const villagesSnapshot = await getDocs(collection(db, 'villages'));
  const availableVillageNames = villagesSnapshot.docs.map(doc => doc.data().name);

  const geoLinkResult = await intelligentGeoLinking({
    claimVillageName: extractedData.village.value,
    availableVillageNames: availableVillageNames,
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
  
  const docRef = await addDoc(collection(db, "claims"), newClaimData);

  return { id: docRef.id, ...newClaimData };
}

export async function updateClaim(claimId: string, updatedData: Partial<Claim>) {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, updatedData);
}

export async function getDssRecommendation(villageId: string): Promise<DssRecommendation[]> {
    const villageDoc = await getDoc(doc(db, 'villages', villageId));
    if (!villageDoc.exists()) {
        throw new Error("Village not found");
    }
    const village = { id: villageDoc.id, ...villageDoc.data() } as Village;

    const q = query(collection(db, 'claims'), where('linkedVillage', '==', village.name));
    const claimsSnapshot = await getDocs(q);
    const claimsInVillage: Claim[] = claimsSnapshot.docs.map(d => ({id: d.id, ...d.data()}) as Claim);

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
    const villageDoc = await getDoc(doc(db, 'villages', villageId));
    if (!villageDoc.exists() || !villageDoc.data().timeSeriesData) {
        throw new Error('Village or time-series data not found');
    }
    const village = villageDoc.data() as Village;

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
    const claimsSnapshot = await getDocs(collection(db, 'claims'));
    return claimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Claim));
}

export async function getVillages(): Promise<Village[]> {
    const villagesSnapshot = await getDocs(collection(db, 'villages'));
    return villagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Village));
}

export async function addCommunityAsset(asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> {
    const docRef = await addDoc(collection(db, 'community_assets'), asset);
    return { id: docRef.id, ...asset };
}

export async function getCommunityAssets(): Promise<CommunityAsset[]> {
    const assetsSnapshot = await getDocs(collection(db, 'community_assets'));
    return assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityAsset));
}

// NOTE: This is a one-time seeding action.
export async function seedInitialData() {
    const claimsCollection = collection(db, 'claims');
    const villagesCollection = collection(db, 'villages');

    const claimsSnapshot = await getDocs(claimsCollection);
    const villagesSnapshot = await getDocs(villagesCollection);

    if (claimsSnapshot.empty && villagesSnapshot.empty) {
        console.log("Seeding initial data...");
        const batch = writeBatch(db);

        VILLAGES.forEach(village => {
            const docRef = doc(db, "villages", village.id);
            batch.set(docRef, village);
        });

        MOCK_CLAIMS.forEach(claim => {
            const docRef = doc(db, "claims", claim.id);
            batch.set(docRef, claim);
        });

        await batch.commit();
        console.log("Seeding complete.");
        return { success: true, message: "Initial data seeded successfully." };
    } else {
        console.log("Data already exists. Skipping seed.");
        return { success: false, message: "Data already exists. Skipping seed." };
    }
}
