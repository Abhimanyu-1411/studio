'use client';

import { cn } from "@/lib/utils";

type ConfidenceBadgeProps = {
    score: number | null | undefined;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
    if (score === null || score === undefined) {
        return <div className="text-sm text-muted-foreground">N/A</div>;
    }

    const confidence = Math.round(score * 100);

    const getConfidenceColor = (s: number) => {
        if (s >= 0.9) return "bg-green-500"; // High confidence
        if (s >= 0.7) return "bg-yellow-500"; // Medium confidence
        return "bg-red-500"; // Low confidence
    }

    const colorClass = getConfidenceColor(score);

    return (
        <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", colorClass)}></div>
            <span className="text-sm font-medium text-muted-foreground">{confidence}%</span>
        </div>
    )
}
