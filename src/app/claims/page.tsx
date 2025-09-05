
'use client';

import { useState, useEffect } from 'react';
import type { Claim } from '@/types';
import { ClaimsTable } from '@/components/claims-table';
import { useToast } from '@/hooks/use-toast';
import { ClaimEdit } from '@/components/claim-edit';
import { getClaims, getVillages, updateClaim } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

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
    // Instead of opening a modal, navigate to the main page with a query param
    // The main page will handle showing the side-by-side view.
    // For simplicity here, we'll use the existing state logic which works within this page
    // but a global state (like Zustand or Context) or URL state would be better for multi-page editing.
    setEditingClaim(claim);
  };
  
  const handleCloseEdit = () => {
    setEditingClaim(null);
  }

  if (loading) {
    return (
       <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
        {editingClaim ? (
             <ClaimEdit
                claim={editingClaim}
                onClose={handleCloseEdit}
                onClaimUpdate={handleClaimUpdate}
                availableVillages={villages}
            />
        ) : (
            <ClaimsTable
                claims={claims}
                onClaimEdit={handleClaimEdit}
                onClaimLink={handleClaimLink}
            />
        )}
    </div>
  );
}
