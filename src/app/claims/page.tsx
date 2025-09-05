
'use client';

import { useState, useEffect } from 'react';
import type { Claim } from '@/types';
import { ClaimsTable } from '@/components/claims-table';
import { useToast } from '@/hooks/use-toast';
import { ClaimEdit } from '@/components/claim-edit';
import { getClaims, getVillages, updateClaim } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [claimsData, villagesData] = await Promise.all([getClaims(), getVillages()]);
        setClaims(claimsData);
        setVillages(villagesData.map(v => v.name));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load claims data.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleClaimUpdate = async (updatedClaim: Claim) => {
    await updateClaim(updatedClaim.id, updatedClaim);
    setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setEditingClaim(null);
    toast({
        title: 'Claim Updated',
        description: `Successfully updated claim for ${updatedClaim.claimantName.value}.`
    });
  };

  const handleClaimLink = async (claimToLink: Claim) => {
    const updatedClaim = { ...claimToLink, status: 'linked' as const };
    await updateClaim(claimToLink.id, { status: 'linked' });
    setClaims(prev => prev.map(c => c.id === claimToLink.id ? updatedClaim : c));
    toast({
        title: 'Claim Linked',
        description: `Claim for ${claimToLink.claimantName.value} is now visible on the map.`
    });
  };

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
  };

  if (loading) {
    return (
       <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (editingClaim) {
    return (
        <ClaimEdit
          claim={editingClaim}
          onClose={() => setEditingClaim(null)}
          onClaimUpdate={handleClaimUpdate}
          availableVillages={villages}
        />
    )
  }

  return (
    <ClaimsTable
      claims={claims}
      onClaimEdit={handleClaimEdit}
      onClaimLink={handleClaimLink}
    />
  );
}
