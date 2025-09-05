
'use client';

import { useState, useEffect } from 'react';
import { VillageAnalysis } from '@/components/dashboard';
import type { Village, Claim } from '@/types';
import { getVillages, getClaims } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalysisPage() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [villagesData, claimsData] = await Promise.all([
                    getVillages(),
                    getClaims(),
                ]);
                setVillages(villagesData);
                setClaims(claimsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    return <VillageAnalysis villages={villages} claims={claims} />;
}
