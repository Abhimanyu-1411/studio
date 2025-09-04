'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';
import type { Claim } from '@/types';

type ClaimsTableProps = {
  claims: Claim[];
  onClaimEdit: (claim: Claim) => void;
};

const claimStatusBadges: Record<Claim['status'], 'default' | 'destructive' | 'secondary'> = {
    linked: 'default',
    unlinked: 'destructive',
    'needs-review': 'secondary',
    reviewed: 'default',
}

const claimStatusText: Record<Claim['status'], string> = {
    linked: 'Linked',
    unlinked: 'Unlinked',
    'needs-review': 'Needs Review',
    reviewed: 'Reviewed',
}


export function ClaimsTable({ claims, onClaimEdit }: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Claims Overview</CardTitle>
                <CardDescription>No claims have been uploaded yet.</CardDescription>
            </CardHeader>
        </Card>
    )
  }
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Claims Overview</CardTitle>
            <CardDescription>A list of all uploaded claims and their status.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Claim Type</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {claims.map((claim) => (
                <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claimantName}</TableCell>
                    <TableCell>{claim.linkedVillage || claim.village}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{claim.claimType}</Badge>
                    </TableCell>
                    <TableCell>{claim.area}</TableCell>
                    <TableCell>
                        <Badge variant={claimStatusBadges[claim.status]}>
                            {claimStatusText[claim.status]}
                        </Badge>
                    </TableCell>
                    <TableCell>
                         <Button variant="ghost" size="icon" onClick={() => onClaimEdit(claim)}>
                            <Edit className="h-4 w-4" />
                         </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
