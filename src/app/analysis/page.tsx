
import { VillageAnalysis } from '@/components/dashboard';
import type { Village, Claim } from '@/types';
import { getVillages, getClaims } from '../actions';

export default async function AnalysisPage() {
    const [villagesData, claimsData] = await Promise.all([
        getVillages(),
        getClaims(),
    ]);
    
    return <VillageAnalysis villages={villagesData} claims={claimsData} />;
}
