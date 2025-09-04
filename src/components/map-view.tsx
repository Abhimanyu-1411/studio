'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useCallback, useEffect, memo } from 'react';
import type { Claim, Village } from '@/types';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';
import L from 'leaflet';

type MapViewProps = {
  claims: Claim[];
  villages: Village[];
  onVillageClick: (village: Village) => void;
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

const getClaimIcon = (claim: Claim) => {
    const color = claimStatusColors[claim.status] || claimTypeColors.default;
    const markerHtml = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${claim.status === 'unlinked' ? '?' : ''}</div>`;
    return L.divIcon({
        html: markerHtml,
        className: '', // important to clear default styling
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const MapController = ({ center, zoom }: { center: {lat: number, lng: number}, zoom: number}) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const MapViewComponent = ({ claims, villages, onVillageClick, onClaimEdit }: MapViewProps) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    ndwi: false,
    water: false,
    agriculture: false,
    forest: false,
  });

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaimId(claim.id);
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  };

  useEffect(() => {
    if (claims.length > 0) {
        const lastClaim = claims[0];
        if (lastClaim.location) {
            setMapCenter(lastClaim.location);
            setMapZoom(12);
        }
    }
  }, [claims]);


  const getPolygonOptions = (village: Village) => {
    const options = {
      color: 'hsl(var(--primary))',
      weight: 2,
      opacity: 0.8,
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.1,
    };

    if (activeLayers.water) {
      options.fillColor = 'blue';
      options.fillOpacity = village.assetCoverage.water / 100 * 0.6;
    }
    if (activeLayers.forest) {
      options.fillColor = 'darkgreen';
      options.fillOpacity = village.assetCoverage.forest / 100 * 0.6;
    }
    if (activeLayers.agriculture) {
      options.fillColor = 'yellow';
      options.fillOpacity = village.assetCoverage.agriculture / 100 * 0.6;
    }
    if (activeLayers.ndwi) {
        options.fillColor = village.ndwi > 0.5 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))';
        options.fillOpacity = 0.6;
    }

    return options;
  };

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={mapCenter} zoom={mapZoom} />
      
      {villages.map((village) => (
         <Polygon
            key={village.id}
            positions={village.bounds}
            pathOptions={getPolygonOptions(village)}
            eventHandlers={{
                click: () => onVillageClick(village),
            }}
          />
      ))}
      
      {claims.map((claim) => (
        <Marker 
          key={claim.id} 
          position={claim.location} 
          icon={getClaimIcon(claim)}
          eventHandlers={{
            click: () => handleClaimClick(claim),
          }}
        >
          {selectedClaimId === claim.id && (
            <Popup>
               <Card className="border-0 shadow-none max-w-sm">
                <CardHeader className="p-2">
                    <CardTitle className="font-headline text-base">{claim.claimantName}</CardTitle>
                    <CardDescription>{claim.claimType} - {claim.area}</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                   <p className="text-sm">Village: {claim.village}</p>
                   <p className="text-sm">Date: {claim.date}</p>
                   <div>
                    {claim.linkedVillage ? (
                        <Badge variant="default" style={{backgroundColor: `hsl(var(--primary))`, color: `hsl(var(--primary-foreground))`}}>Linked to: {claim.linkedVillage} ({(claim.confidenceScore! * 100).toFixed(0)}%)</Badge>
                    ) : (
                        <Badge variant="destructive">Unlinked</Badge>
                    )}
                    {claim.status === 'needs-review' && (
                        <Badge variant="destructive" className="ml-2">Needs Review</Badge>
                    )}
                   </div>
                </CardContent>
                {claim.status === 'needs-review' && (
                    <CardFooter className="p-2">
                        <Button variant="outline" size="sm" onClick={() => onClaimEdit(claim)}>
                            <Edit className="mr-2 h-3 w-3" />
                            Correct Data
                        </Button>
                    </CardFooter>
                )}
            </Card>
            </Popup>
          )}
        </Marker>
      ))}

    </MapContainer>
  );
}

export const MapView = memo(MapViewComponent);
