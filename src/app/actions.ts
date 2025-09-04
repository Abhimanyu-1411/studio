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


  return {
    ...extractedData,
    linkedVillage: geoLinkResult.linkedVillageName,
    confidenceScore: geoLinkResult.confidenceScore,
    status,
  };
}

export async function getDssRecommendation(villageId: string, claims: Claim[]): Promise<DssRecommendation> {
    const village = VILLAGES.find(v => v.id === villageId);
    if (!village) {
        throw new Error("Village not found");
    }

    const claimsInVillage = claims.filter(c => c.linkedVillage === village.name);

    const result = await dssRecommendations({
        villageName: village.name,
        claimCount: claimsInVillage.length,
        pendingClaims: claimsInVillage.filter(c => c.status !== 'reviewed').length,
        cfrClaims: claimsInVillage.filter(c => c.claimType === 'CFR').length,
        ifrClaims: claimsInVillage.filter(c => c.claimType === 'IFR').length,
        waterCoverage: village.assetCoverage.water,
        forestCoverage: village.assetCoverage.forest,
        agriculturalArea: village.assetCoverage.agriculture,
    });

    return result;
}
