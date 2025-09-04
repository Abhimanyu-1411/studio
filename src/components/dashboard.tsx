'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { VILLAGES, MOCK_CLAIMS } from '@/lib/mock-data';
import type { Claim, Village, DssRecommendation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { getDssRecommendation } from '@/app/actions';
import { ClaimEdit } from './claim-edit';
import { Skeleton } from './ui/skeleton';
import { ClaimsTable } from './claims-table';

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), { 
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
});

const StatsCards = ({ claims }: { claims: Claim[] }) => {
    const totalClaims = claims.length;
    const linkedClaims = claims.filter(c => c.status === 'linked' || c.status === 'reviewed' || c.status === 'needs-review').length;
    const pendingClaims = totalClaims - linkedClaims;
    const linkSuccessRate = totalClaims > 0 ? (linkedClaims / totalClaims) * 100 : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Claims</p>
                    <p className="text-2xl font-bold">{totalClaims}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Linked Claims</p>
                    <p className="text-2xl font-bold">{linkedClaims}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingClaims}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Link Success</p>
                    <p className="text-2xl font-bold">{linkSuccessRate.toFixed(0)}%</p>
                </CardContent>
            </Card>
        </div>
    );
};

export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [dssRecommendation, setDssRecommendation] = useState<DssRecommendation | null>(null);
  const [isLoadingDss, setIsLoadingDss] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);

  const handleClaimAdded = (newClaim: Claim) => {
    setClaims((prevClaims) => [newClaim, ...prevClaims]);
    if (newClaim.location) {
        setMapCenter(newClaim.location);
        setMapZoom(12);
    }
  };
  
  const handleClaimUpdate = (updatedClaim: Claim) => {
    setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setEditingClaim(null);
  }
  
  const handleVillageSelect = async (village: Village | null) => {
    if (!village) {
      setSelectedVillage(null);
      setDssRecommendation(null);
      return;
    }
    
    setSelectedVillage(village);
    setIsLoadingDss(true);
    setDssRecommendation(null);
    setMapCenter(village.center);
    setMapZoom(12);
    
    try {
      const recommendation = await getDssRecommendation(village.id, claims);
      setDssRecommendation(recommendation);
    } catch (error) {
      console.error("Failed to get DSS recommendation", error);
    } finally {
      setIsLoadingDss(false);
    }
  }

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  }
  
  const handleClaimSelect = (claim: Claim) => {
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  }

  return (
    <SidebarProvider>
      <SidebarNav 
        claims={claims} 
        onClaimAdded={handleClaimAdded} 
        selectedVillage={selectedVillage}
        onVillageSelect={handleVillageSelect}
        dssRecommendation={dssRecommendation}
        isLoadingDss={isLoadingDss}
        onClaimSelect={handleClaimSelect}
      />
      <SidebarInset>
        <div className="relative h-full w-full flex flex-col">
            <div className="h-1/2 flex flex-col">
              <StatsCards claims={claims} />
              <div className="flex-grow pt-28">
                  <MapView
                      claims={claims} 
                      villages={VILLAGES}
                      onVillageClick={handleVillageSelect}
                      onClaimEdit={handleClaimEdit}
                      center={mapCenter}
                      zoom={mapZoom}
                  />
              </div>
            </div>
            <div className="h-1/2 p-4 overflow-auto">
              <ClaimsTable claims={claims} onClaimEdit={handleClaimEdit} />
            </div>
            <ClaimEdit
              claim={editingClaim}
              onOpenChange={(isOpen) => !isOpen && setEditingClaim(null)}
              onClaimUpdate={handleClaimUpdate}
              availableVillages={VILLAGES.map(v => v.name)}
            />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
