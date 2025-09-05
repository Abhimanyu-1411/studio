
'use client';

import { useState } from 'react';
import { MOCK_CLAIMS } from '@/lib/mock-data';
import type { Claim } from '@/types';
import { ClaimsTable } from '@/components/claims-table';
import { useToast } from '@/hooks/use-toast';
import { ClaimEdit } from '@/components/claim-edit';
import { VILLAGES } from '@/lib/mock-data';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const { toast } = useToast();

  const handleClaimUpdate = (updatedClaim: Claim) => {
    setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setEditingClaim(null);
  };

  const handleClaimLink = (claimToLink: Claim) => {
    setClaims(prev => prev.map(c => c.id === claimToLink.id ? { ...c, status: 'linked' } : c));
    toast({
        title: 'Claim Linked',
        description: `Claim for ${claimToLink.claimantName.value} is now visible on the map.`
    });
  };

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
  };

  if (editingClaim) {
    return (
        <ClaimEdit
          claim={editingClaim}
          onClose={() => setEditingClaim(null)}
          onClaimUpdate={handleClaimUpdate}
          availableVillages={VILLAGES.map(v => v.name)}
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
