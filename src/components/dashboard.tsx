'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MOCK_CLAIMS, VILLAGES } from '@/lib/mock-data';
import type { Claim, Village } from '@/types';
import { ClaimEdit } from './claim-edit';
import { Skeleton } from './ui/skeleton';
import { Header } from './header';
import { RecentClaims } from './recent-claims';
import { QuickActions } from './quick-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, MapPin } from 'lucide-react';
import { ClaimsTable } from './claims-table';
import { ClaimUpload } from './claim-upload';
import { AssetLayersControl, type ActiveLayers } from './asset-layers-control';

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
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


export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
    water: true,
    forest: true,
    agriculture: true,
  });


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

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
    if(claim.location) {
        setMapCenter(claim.location);
        setMapZoom(14);
    }
  }

  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'needs-review' || c.status === 'unlinked').length;
  const approvedClaims = claims.filter(c => c.status === 'linked' || c.status === 'reviewed').length;
  const totalVillages = VILLAGES.length;
  
  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>Explore claims and village boundaries</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                  <MapView
                    claims={claims}
                    villages={VILLAGES}
                    onVillageClick={() => {}}
                    onClaimEdit={handleClaimEdit}
                    center={mapCenter}
                    zoom={mapZoom}
                    activeLayers={activeLayers}
                  >
                    <div className="absolute top-2 right-2 z-[1000]">
                      <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
                    </div>
                  </MapView>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <RecentClaims claims={claims.slice(0, 5)} onClaimSelect={handleClaimEdit} />
              <QuickActions onUpload={() => setUploadOpen(true)} onViewClaims={() => setActiveView('claims-list')} />
            </div>
          </div>
        );
      case 'claims-list':
        return <ClaimsTable claims={claims} onClaimEdit={handleClaimEdit} />;
      case 'villages':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Villages</CardTitle>
              <CardDescription>List of all villages.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {VILLAGES.map(v => <li key={v.id} className="p-2 border rounded-md">{v.name}</li>)}
              </ul>
            </CardContent>
          </Card>
        )
      default:
        return null;
    }
  }

  return (
    <>
      <Header onNavClick={setActiveView} onUploadClick={() => setUploadOpen(true)} />
      <main className="flex-1 p-6 space-y-6">
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Claims" value={totalClaims} icon={FileText} color="#3b82f6" />
            <StatsCard title="Pending Claims" value={pendingClaims} icon={Clock} color="#f59e0b" />
            <StatsCard title="Approved Claims" value={approvedClaims} icon={CheckCircle} color="#10b981" />
            <StatsCard title="Total Villages" value={totalVillages} icon={MapPin} color="#8b5cf6" />
          </div>
        )}
        {renderContent()}
      </main>
      <ClaimEdit
        claim={editingClaim}
        onOpenChange={(isOpen) => !isOpen && setEditingClaim(null)}
        onClaimUpdate={handleClaimUpdate}
        availableVillages={VILLAGES.map(v => v.name)}
      />
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={handleClaimAdded} />
    </>
  );
}
