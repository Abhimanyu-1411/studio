'use client';

import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Polygon } from '@/components/polygon';
import { useState, useCallback } from 'react';
import type { Claim, Village } from '@/types';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';

type MapViewProps = {
  claims: Claim[];
  villages: Village[];
  center: { lat: number; lng: number };
  zoom: number;
  activeLayers: Record<string, boolean>;
  onVillageClick: (village: Village) => void;
  onClaimClick: (claim: Claim) => void;
  onClaimEdit: (claim: Claim) => void;
};

const claimTypeColors = {
  IFR: 'hsl(var(--chart-1))',
  CFR: 'hsl(var(--chart-2))',
  CR: 'hsl(var(--chart-5))',
  'default': 'hsl(var(--muted-foreground))'
}

const claimStatusColors = {
    linked: 'hsl(var(--primary))',
    unlinked: 'hsl(var(--destructive))',
    'needs-review': 'hsl(var(--chart-4))',
    reviewed: 'hsl(var(--primary))',
}

export function MapView({ claims, villages, center, zoom, activeLayers, onVillageClick, onClaimClick, onClaimEdit }: MapViewProps) {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const handleVillageClick = useCallback((village: Village) => {
    setSelectedClaim(null);
    onVillageClick(village);
  }, [onVillageClick]);

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaim(claim);
    onClaimClick(claim)
  };
  
  const closeInfoWindows = () => {
    setSelectedClaim(null);
  }
  
  const getClaimPinColor = (claim: Claim) => {
    return claimStatusColors[claim.status] || claimTypeColors.default;
  }

  const getPolygonOptions = (village: Village) => {
    let fillColor = 'hsl(var(--primary))';
    let fillOpacity = 0.1;

    // This logic allows multiple layers to be overlaid.
    // It is not perfect, as colors will blend.
    // A more advanced implementation might use separate polygon layers.
    if (activeLayers.ndwi) {
        fillColor = village.ndwi > 0.5 ? `hsl(var(--chart-2), 0.5)` : `hsl(var(--chart-4), 0.3)`;
        fillOpacity = 0.5;
    } 
    
    if (activeLayers.forest) {
        fillColor = 'darkgreen';
        fillOpacity = village.assetCoverage.forest / 100 * 0.5;
    }
    
    if (activeLayers.water) {
        fillColor = 'blue';
        fillOpacity = village.assetCoverage.water / 100 * 0.5;
    }
    
    if (activeLayers.agriculture) {
        fillColor = 'yellow';
        fillOpacity = village.assetCoverage.agriculture / 100 * 0.5;
    }

    return {
        strokeColor: 'hsl(var(--primary))',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor,
        fillOpacity,
    }
  };


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
        center={center}
        zoom={zoom}
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
            options={getPolygonOptions(village)}
            onClick={() => handleVillageClick(village)}
          />
        ))}

        {claims.map((claim) => (
           <AdvancedMarker
            key={claim.id}
            position={claim.location}
            onClick={() => handleClaimClick(claim)}
          >
            <div className="relative">
              <svg width="24" height="24" viewBox="0 0 32 32" className="drop-shadow-lg">
                <path 
                    d="M16,32C16,32,28,18,28,12C28,5.373,22.627,0,16,0C9.373,0,4,5.373,4,12C4,18,16,32,16,32Z"
                    fill={getClaimPinColor(claim)}
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">
                {claim.status === 'unlinked' ? '?' : ''}
              </span>
            </div>
          </AdvancedMarker>
        ))}

        {selectedClaim && (
           <InfoWindow position={selectedClaim.location} onCloseClick={closeInfoWindows}>
             <Card className="border-0 shadow-none max-w-sm">
                <CardHeader className="p-2">
                    <CardTitle className="font-headline text-base">{selectedClaim.claimantName}</CardTitle>
                    <CardDescription>{selectedClaim.claimType} - {selectedClaim.area}</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                   <p className="text-sm">Village: {selectedClaim.village}</p>
                   <p className="text-sm">Date: {selectedClaim.date}</p>
                   <div>
                    {selectedClaim.linkedVillage ? (
                        <Badge variant="default" style={{backgroundColor: `hsl(var(--primary))`, color: `hsl(var(--primary-foreground))`}}>Linked to: {selectedClaim.linkedVillage} ({(selectedClaim.confidenceScore! * 100).toFixed(0)}%)</Badge>
                    ) : (
                        <Badge variant="destructive">Unlinked</Badge>
                    )}
                    {selectedClaim.status === 'needs-review' && (
                        <Badge variant="destructive" className="ml-2">Needs Review</Badge>
                    )}
                   </div>
                </CardContent>
                {selectedClaim.status === 'needs-review' && (
                    <CardFooter className="p-2">
                        <Button variant="outline" size="sm" onClick={() => onClaimEdit(selectedClaim)}>
                            <Edit className="mr-2 h-3 w-3" />
                            Correct Data
                        </Button>
                    </CardFooter>
                )}
            </Card>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
