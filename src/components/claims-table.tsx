
'use client';

import { useState } from 'react';
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
import { Edit, Link as LinkIcon, Search } from 'lucide-react';
import type { Claim } from '@/types';
import { Input } from './ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = claims.filter(claim => 
    claim.claimantName.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (claim.linkedVillage || claim.village.value).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
        <CardHeader className="flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Claims List</CardTitle>
            <CardDescription>A list of all uploaded claims and their status.</CardDescription>
          </div>
          <div className="relative w-full md:w-auto mt-4 md:mt-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search claims..."
              className="pl-8 sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
            {filteredClaims.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No claims match your search.</p>
                </div>
             ) : (
                <div className="w-full overflow-x-auto">
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
                        {filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                            <TableCell className="font-medium whitespace-nowrap">{claim.claimantName.value}</TableCell>
                            <TableCell className="whitespace-nowrap">{claim.linkedVillage || claim.village.value}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{claim.claimType.value}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{claim.area.value}</TableCell>
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
        </CardContent>
    </Card>
  );
}
