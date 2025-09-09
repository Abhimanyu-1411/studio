

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
import { Edit, Link as LinkIcon, XCircle, Trash2, LandPlot } from 'lucide-react';
import type { Claim } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ClaimsTableProps = {
  claims: Claim[];
  onClaimEdit: (claim: Claim) => void;
  onClaimLink: (claim: Claim) => void;
  onClaimReject: (claim: Claim) => void;
  onClaimDelete: (claim: Claim) => void;
  onAddAsset: (claim: Claim) => void;
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

const getClaimValue = (field: any): string => {
    if (typeof field === 'object' && field !== null && 'value' in field) {
        return field.value;
    }
    return field as string;
}

export function ClaimsTable({ claims, onClaimEdit, onClaimLink, onClaimReject, onClaimDelete, onAddAsset }: ClaimsTableProps) {
  
  return (
    <>
        {claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <p>No claims match your filters.</p>
            </div>
         ) : (
            <div className="w-full overflow-x-auto border rounded-lg">
                <TooltipProvider>
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
                        <TableCell className="font-medium whitespace-nowrap">{getClaimValue(claim.claimantName)}</TableCell>
                        <TableCell className="whitespace-nowrap">{getClaimValue(claim.village)}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{getClaimValue(claim.claimType)}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getClaimValue(claim.extentOfForestLandOccupied) || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={claimStatusBadges[claim.status]} className="whitespace-nowrap">
                                {claimStatusText[claim.status]}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1 whitespace-nowrap">
                            {claim.status === 'reviewed' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => onClaimLink(claim)}>
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            Link
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Link to Map</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => onAddAsset(claim)}>
                                        <LandPlot className="h-4 w-4" />
                                        <span className="sr-only">Add Asset</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add Community Asset for this Claim</p>
                                </TooltipContent>
                            </Tooltip>
                             {claim.status !== 'rejected' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-yellow-600 hover:text-yellow-700" onClick={() => onClaimReject(claim)}>
                                            <XCircle />
                                            <span className="sr-only">Reject Claim</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reject Claim</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => onClaimEdit(claim)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit Claim</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit / Review Claim</p>
                                </TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onClaimDelete(claim)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete Claim</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete Claim Permanently</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                </TooltipProvider>
            </div>
         )}
    </>
  );
}
