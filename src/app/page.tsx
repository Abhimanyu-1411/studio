
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
import { Logo } from '@/components/icons';

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const StatsCard = ({ title, value, icon: Icon, color, borderColor }: { title: string, value: string | number, icon: React.ElementType, color: string, borderColor: string }) => (
    <Card className={cn("shadow-sm border-t-4", borderColor)}>
      <CardHeader className='pb-2'>
        <div className={cn("p-2 rounded-full self-start", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
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
    setShapefileUploadOpen(false); // Close shapefile upload if open
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  }

  const handleShapefileUploadClick = () => {
    setShapefileUploadOpen(true);
    setEditingClaim(null); // Close claim edit if open
  }
  
  const MapCard = ({ className }: { className?: string }) => (
    <Card className={cn("h-full flex flex-col shadow-lg relative", className)}>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
            <div>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>Explore claims and village boundaries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
                <Button variant="outline" size="icon" onClick={() => setMapFullScreen(!isMapFullScreen)}>
                    {isMapFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
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
  
  const sidePanelComponent = useMemo(() => {
    if (editingClaim) {
      return (
        <ClaimEdit
          claim={editingClaim}
          onClose={() => setEditingClaim(null)}
          onClaimUpdate={handleClaimUpdate}
          availableVillages={villages.map(v => v.name)}
        />
      );
    }
    if (isShapefileUploadOpen) {
      return (
        <ShapefileUpload
          onClose={() => setShapefileUploadOpen(false)}
          onPattasAdded={handlePattasAdded}
        />
      );
    }
    return null;
  }, [editingClaim, isShapefileUploadOpen, villages, handleClaimUpdate]);


  if (loading) {
    return (
      <div className="flex-1 p-8 pt-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-[60vh]" />
            <div className="space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        </div>
      </div>
    );
  }
  
  const showSidePanel = !!sidePanelComponent;

  return (
    <>
      <div className={cn(
        "flex-1 space-y-6 p-4 sm:p-6 md:p-8",
        isMapFullScreen && "p-0"
      )}>
        {!isMapFullScreen && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard title="Total Claims" value={totalClaims} icon={FileText} color="bg-blue-500" borderColor="border-blue-500"/>
                <StatsCard title="Pending Review" value={pendingClaims} icon={Clock} color="bg-yellow-500" borderColor="border-yellow-500"/>
                <StatsCard title="Map-Linked" value={approvedClaims} icon={CheckCircle} color="bg-green-500" borderColor="border-green-500"/>
                <StatsCard title="Total Villages" value={totalVillages} icon={MapPin} color="bg-purple-500" borderColor="border-purple-500"/>
            </div>
        )}
        
        <div className={cn(
            "grid gap-6",
            !isMapFullScreen && (showSidePanel ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"),
        )}>
            <div className={cn(
                "transition-all duration-300",
                 isMapFullScreen ? "fixed inset-0 z-30" : (showSidePanel ? "lg:col-span-2 h-[calc(100vh-300px)]" : "lg:col-span-3 h-[calc(100vh-250px)]")
            )}>
              <MapCard className="h-full w-full"/>
            </div>

            {!isMapFullScreen && (
              <>
                <div className={cn("lg:col-span-1 space-y-6", !showSidePanel && 'hidden')}>
                   {sidePanelComponent}
                </div>
                
                {!showSidePanel && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <RecentClaims claims={claims.slice(0, 5)} onClaimSelect={handleClaimEdit} />
                     <QuickActions 
                        onUpload={() => setUploadOpen(true)} 
                        onViewClaims={() => router.push('/claims')} 
                        onUploadShapefile={handleShapefileUploadClick}
                     />
                  </div>
                )}
              </>
            )}
        </div>
      </div>
      
      {/* Modals are kept outside the main layout grid */}
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
