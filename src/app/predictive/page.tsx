
'use client';

import { PredictiveAnalysis } from "@/components/predictive-analysis";
import { VILLAGES } from "@/lib/mock-data";

export default function PredictivePage() {
    return <PredictiveAnalysis villages={VILLAGES} />;
}
