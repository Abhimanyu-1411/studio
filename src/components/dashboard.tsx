'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { MapView } from '@/components/map-view';
import { VILLAGES } from '@/lib/mock-data';
import type { Claim } from '@/types';

export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);

  const handleClaimAdded = (newClaim: Claim) => {
    setClaims((prevClaims) => [newClaim, ...prevClaims]);
    // Center map on new claim
    setMapCenter(newClaim.location);
    setMapZoom(12);
  };
  
  const handleClaimSelect = (claim: Claim) => {
    setMapCenter(claim.location);
    setMapZoom(14);
  }
  
  const handleLayerToggle = (layer: 'ndwi' | 'ndvi', toggled: boolean) => {
    console.log(`Layer ${layer} toggled: ${toggled}`);
    // In a real app, this would trigger a map layer change
  }

  return (
    <SidebarProvider>
      <SidebarNav claims={claims} onClaimAdded={handleClaimAdded} onClaimSelect={handleClaimSelect} onLayerToggle={handleLayerToggle} />
      <SidebarInset>
        <MapView 
            claims={claims} 
            villages={VILLAGES}
            center={mapCenter}
            zoom={mapZoom}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
