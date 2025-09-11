
import { PredictiveAnalysis } from "@/components/predictive-analysis";
import type { Village } from "@/types";
import { getVillages } from "../actions";

export default async function PredictivePage() {
    const villages = await getVillages();
    
    return <PredictiveAnalysis villages={villages} />;
}
