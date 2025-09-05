
'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, memo, type ReactNode } from 'react';
import type { Claim, Village, CommunityAsset } from '@/types';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';
import L from 'leaflet';
import { type ActiveLayers } from './asset-layers-control';

type MapViewProps = {
  claims: Claim[];
  villages: Village[];
  assets: CommunityAsset[];
  onVillageClick: (village: Village) => void;
  onClaimEdit: (claim: Claim) => void;
  center: { lat: number; lng: number };
  zoom: number;
  activeLayers: ActiveLayers;
  children?: ReactNode;
};

const claimStatusColors = {
  linked: 'hsl(var(--primary))',
  unlinked: 'hsl(var(--destructive))',
  'needs-review': 'hsl(var(--chart-4))',
  reviewed: 'hsl(var(--primary))',
};

const getClaimIcon = (claim: Claim) => {
  const color = claimStatusColors[claim.status] || 'hsl(var(--muted-foreground))';
  const markerHtml = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${claim.status === 'unlinked' ? '?' : ''}</div>`;
  return L.divIcon({
    html: markerHtml,
    className: '', // important to clear default styling
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapController = ({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const assetLayerStyles = {
  ndwi: { color: '#2563eb', fillColor: '#3b82f6', weight: 1 },
  forest: { color: '#166534', fillColor: '#22c55e', weight: 1 },
  agriculture: { color: '#ca8a04', fillColor: '#facc15', weight: 1 },
  other: { color: '#a21caf', fillColor: '#c026d3', weight: 1},
};

const MapViewComponent = ({ claims, villages, assets, onVillageClick, onClaimEdit, center, zoom, activeLayers, children }: MapViewProps) => {
  const getPolygonOptions = (village: Village) => {
    return {
      color: 'hsl(var(--primary))',
      weight: 2,
      opacity: 0.8,
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.1,
    };
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />

      {villages.map((village) => (
        <React.Fragment key={village.id}>
            <Polygon
            positions={village.bounds}
            pathOptions={getPolygonOptions(village)}
            eventHandlers={{
                click: () => onVillageClick(village),
            }}
            >
              <Popup>
                <div className="font-bold text-base">{village.name}</div>
                <div className="text-sm">
                  <p>Water Coverage: {village.assetCoverage.water}%</p>
                  <p>Forest Coverage: {village.assetCoverage.forest}%</p>
                  <p>Agriculture: {village.assetCoverage.agriculture}%</p>
                </div>
              </Popup>
            </Polygon>
            
            {activeLayers.ndwi && village.assetGeometries?.ndwi.map((poly, i) => 
                <Polygon key={`${village.id}-ndwi-${i}`} positions={poly.polygon} pathOptions={{...assetLayerStyles.ndwi, fillOpacity: 0.5}} />
            )}
            {activeLayers.forest && village.assetGeometries?.forest.map((poly, i) => 
                <Polygon key={`${village.id}-forest-${i}`} positions={poly.polygon} pathOptions={{...assetLayerStyles.forest, fillOpacity: 0.5}} />
            )}
            {activeLayers.agriculture && village.assetGeometries?.agriculture.map((poly, i) => 
                <Polygon key={`${village.id}-agri-${i}`} positions={poly.polygon} pathOptions={{...assetLayerStyles.agriculture, fillOpacity: 0.5}} />
            )}
        </React.Fragment>
      ))}

      {assets.map((asset) => (
         asset.geometry && <Polygon key={asset.id} positions={asset.geometry} pathOptions={{...assetLayerStyles[asset.assetType as keyof typeof assetLayerStyles] || assetLayerStyles.other, fillOpacity: 0.7}}>
            <Popup>
                <div className="font-bold text-base capitalize">{asset.assetType.replace('_', ' ')}</div>
                <p className="text-sm">{asset.description}</p>
            </Popup>
         </Polygon>
      ))}

      {claims.map((claim) => (
        <Marker
          key={claim.id}
          position={claim.location}
          icon={getClaimIcon(claim)}
        >
          <Popup>
            <Card className="border-0 shadow-none max-w-sm">
              <CardHeader className="p-2">
                <CardTitle className="text-base">{claim.claimantName.value}</CardTitle>
                <CardDescription>{claim.claimType.value} - {claim.area.value}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 space-y-2 text-sm">
                <p>Village: {claim.village.value}</p>
                <p>Date: {claim.date.value}</p>
                <div>
                  {claim.linkedVillage ? (
                    <Badge variant="secondary">Linked to: {claim.linkedVillage} ({(claim.geoLinkConfidence! * 100).toFixed(0)}%)</Badge>
                  ) : (
                    <Badge variant="destructive">Unlinked</Badge>
                  )}
                  {claim.status === 'needs-review' && (
                    <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">Needs Review</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-2">
                <Button variant="outline" size="sm" onClick={() => onClaimEdit(claim)}>
                  <Edit className="mr-2 h-3 w-3" />
                  Correct Data
                </Button>
              </CardFooter>
            </Card>
          </Popup>
        </Marker>
      ))}
      {children}
    </MapContainer>
  );
}

export const MapView = memo(MapViewComponent);
