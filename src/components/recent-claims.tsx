'use client';

import type { Claim } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Button } from './ui/button';

type RecentClaimsProps = {
  claims: Claim[];
  onClaimSelect: (claim: Claim) => void;
};

export function RecentClaims({ claims, onClaimSelect }: RecentClaimsProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recent Claims</CardTitle>
        <CardDescription>The last 5 claims that were uploaded.</CardDescription>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex justify-center items-center h-24 w-24 rounded-full bg-gray-100 mx-auto">
                <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <p className="mt-4 font-medium">No recent claims</p>
            <p className="text-sm">Upload a new claim to see it here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {claims.map((claim) => (
              <li key={claim.id} className="flex items-center">
                <div className="p-2 bg-muted rounded-md mr-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{claim.claimantName.value}</p>
                  <p className="text-sm text-muted-foreground">{claim.village.value}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onClaimSelect(claim)}>View</Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
