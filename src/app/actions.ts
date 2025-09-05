'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { intelligentGeoLinking } from '@/ai/flows/intelligent-geo-linking';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { AVAILABLE_VILLAGE_NAMES, VILLAGES } from '@/lib/mock-data';
import type { DssRecommendation, Claim } from '@/types';

export async function handleClaimUpload(documentDataUri: string) {
  const extractedData = await extractClaimData({ documentDataUri });

  const geoLinkResult = await intelligentGeoLinking({
    claimVillageName: extractedData.village,
    availableVillageNames: AVAILABLE_VILLAGE_NAMES,
  });

  let status: Claim['status'] = 'unlinked';
  if (geoLinkResult.linkedVillageName) {
    if (geoLinkResult.confidenceScore < 0.8) {
        status = 'needs-review';
    } else {
        status = 'linked';
    }
  }


  const randomLocation = {
      lat: 26.5 + (Math.random() - 0.5) * 0.5,
      lng: 82.4 + (Math.random() - 0.5) * 0.8
  };
  
  const newClaim: Omit<Claim, 'id' | 'documentUrl' | 'documentType'> = {
    ...extractedData,
    linkedVillage: geoLinkResult.linkedVillageName,
    confidenceScore: geoLinkResult.confidenceScore,
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
        cfrClaims: claimsInVillage.filter(c => c.claimType === 'CFR').length,
        ifrClaims: claimsInVillage.filter(c => c.claimType === 'IFR').length,
        waterCoverage: village.assetCoverage.water,
        forestCoverage: village.assetCoverage.forest,
        agriculturalArea: village.assetCoverage.agriculture,
    });

    return result.sort((a, b) => b.priority - a.priority);
}
