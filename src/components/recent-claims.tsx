'use client';

import type { Claim } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Button } from './ui/button';

type RecentClaimsProps = {
  claims: Claim[];
  onClaimSelect: (claim: Claim) => void;
};

export function RecentClaims({ claims, onClaimSelect }: RecentClaimsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Claims</CardTitle>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12" />
            <p className="mt-4">No recent claims</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {claims.map((claim) => (
              <li key={claim.id} className="flex items-center">
                <div className="p-2 bg-muted rounded-md mr-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{claim.claimantName}</p>
                  <p className="text-sm text-muted-foreground">{claim.village}</p>
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
