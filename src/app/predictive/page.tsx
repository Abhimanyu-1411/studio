
'use client';

import { PredictiveAnalysis } from "@/components/predictive-analysis";
import type { Village } from "@/types";
import { getVillages } from "../actions";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PredictivePage() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVillagesData() {
            try {
                const data = await getVillages();
                setVillages(data);
            } catch (error) {
                console.error("Failed to fetch villages data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVillagesData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-3">
                    <Skeleton className="h-full min-h-[500px] w-full" />
                </div>
            </div>
        );
    }
    
    return <PredictiveAnalysis villages={villages} />;
}
