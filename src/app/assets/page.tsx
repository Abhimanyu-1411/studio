
'use client';

import { useState } from 'react';
import { CommunityAssets } from "@/components/community-assets";
import { AssetEdit } from "@/components/asset-edit";
import { VILLAGES } from "@/lib/mock-data";
import type { CommunityAsset } from "@/types";

export default function AssetsPage() {
    const [assets, setAssets] = useState<CommunityAsset[]>([]);
    const [isAssetEditOpen, setAssetEditOpen] = useState(false);

    const handleAssetAdded = (newAsset: CommunityAsset) => {
        setAssets(prev => [...prev, newAsset]);
    };

    return (
        <>
            <CommunityAssets 
                assets={assets} 
                villages={VILLAGES} 
                onAddAsset={() => setAssetEditOpen(true)} 
            />
            <AssetEdit 
                open={isAssetEditOpen} 
                onOpenChange={setAssetEditOpen} 
                onAssetAdded={handleAssetAdded} 
                villages={VILLAGES} 
            />
        </>
    );
}
