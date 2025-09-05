
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Claim, Village, CommunityAsset } from '@/types';
import { ClaimEdit } from '@/components/claim-edit';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentClaims } from '@/components/recent-claims';
import { QuickActions } from '@/components/quick-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, MapPin } from 'lucide-react';
import { ClaimUpload } from '@/components/claim-upload';
import { AssetLayersControl, type ActiveLayers } from '@/components/asset-layers-control';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AssetEdit } from '@/components/asset-edit';
import { getClaims, getVillages, getCommunityAssets, updateClaim, addCommunityAsset, handleClaimUpload } from './actions';
import { Button } from '@/components/ui/button';

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
  const [isAssetEditOpen, setAssetEditOpen] = useState(false);
  const [assets, setAssets] = useState<CommunityAsset[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [loading, setLoading] = useState(true);
  
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

  if (editingClaim) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-[50vh] lg:h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <div>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>Reference the map to correct claim data</CardDescription>
              </div>
              <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <MapView
                claims={linkedClaims}
                villages={villages}
                assets={assets}
                onVillageClick={() => {}}
                onClaimEdit={handleClaimEdit}
                center={mapCenter}
                zoom={mapZoom}
                activeLayers={activeLayers}
              />
            </CardContent>
          </Card>
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
              <Card className="h-[40vh] md:h-[60vh]">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                          <CardTitle>Interactive Map</CardTitle>
                          <CardDescription>Explore claims and village boundaries</CardDescription>
                      </div>
                      <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)] p-0">
                      <MapView
                          claims={linkedClaims}
                          villages={villages}
                          assets={assets}
                          onVillageClick={() => {}}
                          onClaimEdit={handleClaimEdit}
                          center={mapCenter}
                          zoom={mapZoom}
                          activeLayers={activeLayers}
                      />
                  </CardContent>
              </Card>
              <div className="space-y-4">
                  <RecentClaims claims={claims.slice(0, 5)} onClaimSelect={handleClaimEdit} />
                  <QuickActions onUpload={() => setUploadOpen(true)} onViewClaims={() => { router.push('/claims')}} />
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
