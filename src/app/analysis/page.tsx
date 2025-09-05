
'use client';

import { MOCK_CLAIMS, VILLAGES } from '@/lib/mock-data';
import { VillageAnalysis } from '@/components/dashboard';

export default function AnalysisPage() {
    return <VillageAnalysis villages={VILLAGES} claims={MOCK_CLAIMS} />;
}
