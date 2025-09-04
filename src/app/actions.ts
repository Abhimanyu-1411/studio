'use server';

import { extractClaimData } from '@/ai/flows/extract-claim-data';
import { intelligentGeoLinking } from '@/ai/flows/intelligent-geo-linking';
import { dssRecommendations } from '@/ai/flows/dss-recommendations';
import { AVAILABLE_VILLAGE_NAMES, VILLAGES } from '@/lib/mock-data';
import type { DssRecommendation } from '@/types';

export async function handleClaimUpload(documentDataUri: string) {
  const extractedData = await extractClaimData({ documentDataUri });

  const geoLinkResult = await intelligentGeoLinking({
    claimVillageName: extractedData.village,
    availableVillageNames: AVAILABLE_VILLAGE_NAMES,
  });

  return {
    ...extractedData,
    linkedVillage: geoLinkResult.linkedVillageName,
    confidenceScore: geoLinkResult.confidenceScore,
  };
}

export async function getDssRecommendation(villageId: string, claimType: string, claimCount: number): Promise<DssRecommendation> {
    const village = VILLAGES.find(v => v.id === villageId);
    if (!village) {
        throw new Error("Village not found");
    }

    const result = await dssRecommendations({
        villageName: village.name,
        claimCount,
        ndwi: village.ndwi,
        claimType,
    });

    return result;
}
