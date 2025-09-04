'use client';

import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Polygon } from '@/components/polygon';
import { useState, useCallback } from 'react';
import type { Claim, Village, DssRecommendation } from '@/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getDssRecommendation } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type MapViewProps = {
  claims: Claim[];
  villages: Village[];
  center: { lat: number; lng: number };
  zoom: number;
};

export function MapView({ claims, villages, center, zoom }: MapViewProps) {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [dssData, setDssData] = useState<DssRecommendation | null>(null);
  const [isLoadingDss, setIsLoadingDss] = useState(false);

  const handleVillageClick = useCallback(async (village: Village) => {
    setSelectedClaim(null);
    setSelectedVillage(village);
    setIsLoadingDss(true);
    setDssData(null);
    try {
      const claimsInVillage = claims.filter(c => c.linkedVillage === village.name);
      // Using the first claim type as representative for the DSS call
      const representativeClaimType = claimsInVillage.length > 0 ? claimsInVillage[0].claimType : "General";
      const recommendation = await getDssRecommendation(village.id, representativeClaimType, claimsInVillage.length);
      setDssData(recommendation);
    } catch (error) {
      console.error("Failed to get DSS recommendation", error);
    } finally {
      setIsLoadingDss(false);
    }
  }, [claims]);

  const handleClaimClick = (claim: Claim) => {
    setSelectedVillage(null);
    setSelectedClaim(claim);
  };
  
  const closeInfoWindows = () => {
    setSelectedVillage(null);
    setSelectedClaim(null);
  }

  const polygonOptions = (village: Village) => ({
    strokeColor: 'hsl(var(--primary))',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: village.ndwi > 0.5 ? `hsl(var(--primary), 0.5)` : `hsl(var(--accent), 0.3)`,
    fillOpacity: 0.35,
  });

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center p-8">
                <h2 className="text-lg font-semibold">Google Maps API Key Missing</h2>
                <p className="text-muted-foreground">Please set the <code className="bg-destructive/20 text-destructive p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable.</p>
            </div>
        </div>
    )
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="geoclaim_map"
        onDragend={closeInfoWindows}
        onClick={closeInfoWindows}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="h-full w-full"
      >
        {villages.map((village) => (
          <Polygon
            key={village.id}
            paths={village.bounds}
            options={polygonOptions(village)}
            onClick={() => handleVillageClick(village)}
          />
        ))}

        {claims.map((claim) => (
          <AdvancedMarker
            key={claim.id}
            position={claim.location}
            onClick={() => handleClaimClick(claim)}
          >
             <span className="text-3xl">{claim.status === 'linked' ? '📍' : '❓'}</span>
          </AdvancedMarker>
        ))}

        {selectedVillage && (
          <InfoWindow position={selectedVillage.center} onCloseClick={closeInfoWindows}>
            <Card className="border-0 shadow-none max-w-sm">
                <CardHeader className="p-2">
                    <CardTitle className="font-headline text-base">{selectedVillage.name}</CardTitle>
                    <CardDescription>NDWI: {selectedVillage.ndwi}</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                    <h4 className="font-bold text-sm mb-2">Decision Support</h4>
                    {isLoadingDss && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</div>}
                    {dssData && (
                        <div>
                            <p className="text-sm font-semibold text-primary">{dssData.recommendation}</p>
                            <p className="text-xs text-muted-foreground mt-1">{dssData.justification}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </InfoWindow>
        )}

        {selectedClaim && (
           <InfoWindow position={selectedClaim.location} onCloseClick={closeInfoWindows}>
             <Card className="border-0 shadow-none max-w-sm">
                <CardHeader className="p-2">
                    <CardTitle className="font-headline text-base">{selectedClaim.claimantName}</CardTitle>
                    <CardDescription>{selectedClaim.claimType} - {selectedClaim.area}</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                   <p className="text-sm">Village: {selectedClaim.village}</p>
                   <p className="text-sm">Date: {selectedClaim.date}</p>
                   <div className="mt-2">
                    {selectedClaim.linkedVillage ? (
                        <Badge variant="default" className="bg-primary/80">Linked to: {selectedClaim.linkedVillage} ({(selectedClaim.confidenceScore! * 100).toFixed(0)}%)</Badge>
                    ) : (
                        <Badge variant="destructive">Unlinked</Badge>
                    )}
                   </div>
                </CardContent>
            </Card>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
