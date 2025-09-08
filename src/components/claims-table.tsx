
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Edit, Link as LinkIcon, XCircle } from 'lucide-react';
import type { Claim } from '@/types';

type ClaimsTableProps = {
  claims: Claim[];
  onClaimEdit: (claim: Claim) => void;
  onClaimLink: (claim: Claim) => void;
  onClaimReject: (claim: Claim) => void;
};

const claimStatusBadges: Record<Claim['status'], 'default' | 'destructive' | 'secondary' | 'outline'> = {
    linked: 'default',
    unlinked: 'destructive',
    'needs-review': 'secondary',
    reviewed: 'outline',
    rejected: 'destructive'
}

const claimStatusText: Record<Claim['status'], string> = {
    linked: 'Linked to Map',
    unlinked: 'Unlinked',
    'needs-review': 'Needs Review',
    reviewed: 'Reviewed',
    rejected: 'Rejected'
}


export function ClaimsTable({ claims, onClaimEdit, onClaimLink, onClaimReject }: ClaimsTableProps) {
  
  return (
    <>
        {claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <p>No claims match your filters.</p>
            </div>
         ) : (
            <div className="w-full overflow-x-auto border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Claim Type</TableHead>
                    <TableHead>Extent of Land</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {claims.map((claim) => (
                    <TableRow key={claim.id}>
                        <TableCell className="font-medium whitespace-nowrap">{(claim.claimantName as any).value}</TableCell>
                        <TableCell className="whitespace-nowrap">{claim.linkedVillage || (claim.village as any).value}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{(claim.claimType as any).value}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{(claim.extentOfForestLandOccupied as any).value}</TableCell>
                        <TableCell>
                            <Badge variant={claimStatusBadges[claim.status]} className="whitespace-nowrap">
                                {claimStatusText[claim.status]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                            {claim.status === 'reviewed' && (
                                <Button variant="outline" size="sm" onClick={() => onClaimLink(claim)}>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Link to Map
                                </Button>
                            )}
                             {claim.status !== 'rejected' && (
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onClaimReject(claim)}>
                                    <XCircle />
                                    <span className="sr-only">Reject Claim</span>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => onClaimEdit(claim)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Claim</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
         )}
    </>
  );
}
