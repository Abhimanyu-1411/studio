
'use client';

import { useState, useEffect } from 'react';
import { CommunityAssets } from "@/components/community-assets";
import { AssetEdit } from "@/components/asset-edit";
import type { CommunityAsset, Village } from "@/types";
import { getCommunityAssets, getVillages, addCommunityAsset } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssetsPage() {
    const [assets, setAssets] = useState<CommunityAsset[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssetEditOpen, setAssetEditOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [assetsData, villagesData] = await Promise.all([
                    getCommunityAssets(),
                    getVillages(),
                ]);
                setAssets(assetsData);
                setVillages(villagesData);
            } catch (error) {
                console.error("Failed to load asset data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAssetAdded = async (newAssetData: Omit<CommunityAsset, 'id'>) => {
        const newAsset = await addCommunityAsset(newAssetData);
        setAssets(prev => [...prev, newAsset]);
    };

    if (loading) {
        return <Skeleton className="h-96 w-full" />
    }

    return (
        <>
            <CommunityAssets 
                assets={assets} 
                villages={villages} 
                onAddAsset={() => setAssetEditOpen(true)} 
            />
            <AssetEdit 
                open={isAssetEditOpen} 
                onOpenChange={setAssetEditOpen} 
                onAssetAdded={handleAssetAdded} 
                villages={villages} 
            />
        </>
    );
}
