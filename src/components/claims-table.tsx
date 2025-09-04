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
import { Edit, Link } from 'lucide-react';
import type { Claim } from '@/types';

type ClaimsTableProps = {
  claims: Claim[];
  onClaimEdit: (claim: Claim) => void;
  onClaimLink: (claim: Claim) => void;
};

const claimStatusBadges: Record<Claim['status'], 'default' | 'destructive' | 'secondary' | 'outline'> = {
    linked: 'default',
    unlinked: 'destructive',
    'needs-review': 'secondary',
    reviewed: 'outline',
}

const claimStatusText: Record<Claim['status'], string> = {
    linked: 'Linked to Map',
    unlinked: 'Unlinked',
    'needs-review': 'Needs Review',
    reviewed: 'Reviewed',
}


export function ClaimsTable({ claims, onClaimEdit, onClaimLink }: ClaimsTableProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Claims List</CardTitle>
            <CardDescription>A list of all uploaded claims and their status.</CardDescription>
        </CardHeader>
        <CardContent>
            {claims.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No claims have been uploaded yet.</p>
                </div>
             ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Claim Type</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right space-x-2">
                             {claim.status === 'reviewed' && (
                                 <Button variant="outline" size="sm" onClick={() => onClaimLink(claim)}>
                                    <Link className="mr-2 h-4 w-4" />
                                    Link to Map
                                 </Button>
                             )}
                             <Button variant="ghost" size="icon" onClick={() => onClaimEdit(claim)}>
                                <Edit className="h-4 w-4" />
                             </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
             )}
        </CardContent>
    </Card>
  );
}
