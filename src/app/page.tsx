
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Claim, Village, CommunityAsset, Patta } from '@/types';
import { ClaimEdit } from '@/components/claim-edit';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentClaims } from '@/components/recent-claims';
import { QuickActions } from '@/components/quick-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, MapPin, Maximize, Minimize } from 'lucide-react';
import { ClaimUpload } from '@/components/claim-upload';
import { ShapefileUpload } from '@/components/shapefile-upload';
import { AssetLayersControl, type ActiveLayers } from '@/components/asset-layers-control';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AssetEdit } from '@/components/asset-edit';
import { getClaims, getVillages, getCommunityAssets, updateClaim, addCommunityAsset, handleClaimUpload } from './actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const StatsCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
  <Card className="shadow-sm">
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}1A` }}>
        <Icon className="h-6 w-6" style={{ color: color }} />
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isShapefileUploadOpen, setShapefileUploadOpen] = useState(false);
  const [isAssetEditOpen, setAssetEditOpen] = useState(false);
  const [assets, setAssets] = useState<CommunityAsset[]>([]);
  const [pattas, setPattas] = useState<Patta[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [loading, setLoading] = useState(true);
  const [isMapFullScreen, setMapFullScreen] = useState(false);
  
  const router = useRouter();

  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
    ndwi: false,
    forest: false,
    agriculture: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [claimsData, villagesData, assetsData] = await Promise.all([
          getClaims(),
          getVillages(),
          getCommunityAssets(),
        ]);
        setClaims(claimsData);
        setVillages(villagesData);
        setAssets(assetsData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data from the server.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);


  const handleClaimAdded = (newClaim: Claim) => {
    setClaims((prevClaims) => [newClaim, ...prevClaims]);
    if (newClaim.location) {
        setMapCenter(newClaim.location);
        setMapZoom(12);
    }
  };
  
  const handlePattasAdded = (newPattas: Patta[]) => {
    setPattas(prev => [...prev, ...newPattas]);
    if (newPattas.length > 0 && newPattas[0].geometry.length > 0) {
      const firstPattaGeometry = newPattas[0].geometry;
      const centerLat = firstPattaGeometry.reduce((sum, p) => sum + p.lat, 0) / firstPattaGeometry.length;
      const centerLng = firstPattaGeometry.reduce((sum, p) => sum + p.lng, 0) / firstPattaGeometry.length;
      setMapCenter({lat: centerLat, lng: centerLng});
      setMapZoom(14);
    }
    setShapefileUploadOpen(false);
  };

  const handleClaimUpdate = async (updatedClaim: Claim) => {
    await updateClaim(updatedClaim.id, updatedClaim);
    setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setEditingClaim(null);
  }

  const handleAssetAdded = async (newAssetData: Omit<CommunityAsset, 'id'>) => {
    const newAsset = await addCommunityAsset(newAssetData);
    setAssets(prev => [...prev, newAsset]);
  };

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  }
  
  const MapCard = ({ className, inFullScreen = false }: { className?: string, inFullScreen?: boolean }) => (
    <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <div>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>Explore claims and village boundaries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
                <Button variant="outline" size="icon" onClick={() => setMapFullScreen(!isMapFullScreen)}>
                    {inFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <MapView
                claims={linkedClaims}
                villages={villages}
                assets={assets}
                pattas={pattas}
                onVillageClick={() => {}}
                onClaimEdit={handleClaimEdit}
                center={mapCenter}
                zoom={mapZoom}
                activeLayers={activeLayers}
            />
        </CardContent>
    </Card>
  );


  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'needs-review' || c.status === 'unlinked').length;
  const approvedClaims = claims.filter(c => c.status === 'linked').length;
  const totalVillages = villages.length;

  const linkedClaims = useMemo(() => claims.filter(c => c.status === 'linked'), [claims]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="w-64 h-4" />
      </div>
    );
  }

  if (isMapFullScreen) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-background">
            <MapCard className="h-full w-full border-none rounded-none" inFullScreen={true} />
        </div>
        <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={handleClaimAdded} />
        <AssetEdit 
          open={isAssetEditOpen} 
          onOpenChange={setAssetEditOpen} 
          onAssetAdded={handleAssetAdded} 
          villages={villages} 
        />
      </>
    );
  }

  if (editingClaim) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-[50vh] lg:h-full">
          <MapCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <ClaimEdit
            claim={editingClaim}
            onClose={() => setEditingClaim(null)}
            onClaimUpdate={handleClaimUpdate}
            availableVillages={villages.map(v => v.name)}
          />
        </div>
      </div>
    );
  }

  if (isShapefileUploadOpen) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-[50vh] lg:h-full">
          <MapCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <ShapefileUpload 
            onClose={() => setShapefileUploadOpen(false)}
            onPattasAdded={handlePattasAdded}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
           <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              <StatsCard title="Total Claims" value={totalClaims} icon={FileText} color="#3b82f6" />
              <StatsCard title="Pending Review" value={pendingClaims} icon={Clock} color="#f59e0b" />
              <StatsCard title="Linked to Map" value={approvedClaims} icon={CheckCircle} color="#10b981" />
              <StatsCard title="Total Villages" value={totalVillages} icon={MapPin} color="#8b5cf6" />
           </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MapCard className="h-[40vh] md:h-[60vh]" />
              <div className="space-y-4">
                  <RecentClaims claims={claims.slice(0, 5)} onClaimSelect={handleClaimEdit} />
                  <QuickActions 
                    onUpload={() => setUploadOpen(true)} 
                    onViewClaims={() => { router.push('/claims')}} 
                    onUploadShapefile={() => setShapefileUploadOpen(true)}
                    />
              </div>
          </div>
      </div>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={handleClaimAdded} />
      <AssetEdit 
        open={isAssetEditOpen} 
        onOpenChange={setAssetEditOpen} 
        onAssetAdded={handleAssetAdded} 
        villages={villages} 
      />
    </>
  );
}
