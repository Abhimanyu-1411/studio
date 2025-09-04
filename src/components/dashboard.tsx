'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { MapView } from '@/components/map-view';
import { VILLAGES } from '@/lib/mock-data';
import type { Claim, Village, DssRecommendation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { getDssRecommendation } from '@/app/actions';

export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    ndwi: false,
    ndvi: false,
    water: false,
    agriculture: false,
    forest: false,
  });
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [dssRecommendation, setDssRecommendation] = useState<DssRecommendation | null>(null);
  const [isLoadingDss, setIsLoadingDss] = useState(false);

  const handleClaimAdded = (newClaim: Claim) => {
    setClaims((prevClaims) => [newClaim, ...prevClaims]);
    // Center map on new claim
    setMapCenter(newClaim.location);
    setMapZoom(12);
  };
  
  const handleClaimSelect = (claim: Claim) => {
    setSelectedVillage(null);
    setMapCenter(claim.location);
    setMapZoom(14);
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
    
    try {
      const recommendation = await getDssRecommendation(village.id, claims);
      setDssRecommendation(recommendation);
    } catch (error) {
      console.error("Failed to get DSS recommendation", error);
    } finally {
      setIsLoadingDss(false);
    }
  }
  
  const handleLayerToggle = (layer: string, toggled: boolean) => {
    setActiveLayers(prev => ({ ...prev, [layer]: toggled }));
  }

  const getStats = () => {
    const totalClaims = claims.length;
    const linkedClaims = claims.filter(c => c.status === 'linked').length;
    const pendingClaims = totalClaims - linkedClaims;
    const linkSuccessRate = totalClaims > 0 ? (linkedClaims / totalClaims) * 100 : 0;
    return { totalClaims, linkedClaims, pendingClaims, linkSuccessRate };
  }
  const stats = getStats();

  return (
    <SidebarProvider>
      <SidebarNav 
        claims={claims} 
        onClaimAdded={handleClaimAdded} 
        onClaimSelect={handleClaimSelect} 
        onLayerToggle={handleLayerToggle}
        selectedVillage={selectedVillage}
        onVillageSelect={handleVillageSelect}
        dssRecommendation={dssRecommendation}
        isLoadingDss={isLoadingDss}
      />
      <SidebarInset>
        <div className="relative h-full w-full">
            <MapView 
                claims={claims} 
                villages={VILLAGES}
                center={mapCenter}
                zoom={mapZoom}
                activeLayers={activeLayers}
                onVillageClick={handleVillageSelect}
                onClaimClick={handleClaimSelect}
            />
            <div className="absolute top-4 left-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Claims</p>
                        <p className="text-2xl font-bold">{stats.totalClaims}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Linked Claims</p>
                        <p className="text-2xl font-bold">{stats.linkedClaims}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{stats.pendingClaims}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Link Success</p>
                        <p className="text-2xl font-bold">{stats.linkSuccessRate.toFixed(0)}%</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
