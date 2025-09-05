
'use client';

import { useState, useEffect } from 'react';
import { VillageAnalysis } from '@/components/dashboard';
import type { Village } from '@/types';
import { getVillages } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalysisPage() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVillages() {
            try {
                const villagesData = await getVillages();
                setVillages(villagesData);
            } catch (error) {
                console.error("Failed to fetch villages", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVillages();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    // Note: VillageAnalysis component expects `claims`, but it's only used inside getDssRecommendation
    // which now fetches claims itself. We can pass an empty array.
    return <VillageAnalysis villages={villages} claims={[]} />;
}
