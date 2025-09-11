
import { CommunityAssets } from "@/components/community-assets";
import type { CommunityAsset, Village } from "@/types";
import { getCommunityAssets, getVillages } from '../actions';

export default async function AssetsPage() {
    const [assetsData, villagesData] = await Promise.all([
        getCommunityAssets(),
        getVillages(),
    ]);

    return (
        <CommunityAssets 
            assets={assetsData} 
            villages={villagesData} 
        />
    );
}
