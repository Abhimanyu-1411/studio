'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MOCK_CLAIMS, VILLAGES } from '@/lib/mock-data';
import type { Claim, Village, DssRecommendation } from '@/types';
import { ClaimEdit } from './claim-edit';
import { Skeleton } from './ui/skeleton';
import { Header } from './header';
import { RecentClaims } from './recent-claims';
import { QuickActions } from './quick-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, MapPin, Lightbulb, ThumbsUp, Loader2, AlertCircle } from 'lucide-react';
import { ClaimsTable } from './claims-table';
import { ClaimUpload } from './claim-upload';
import { AssetLayersControl, type ActiveLayers } from './asset-layers-control';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDssRecommendation } from '@/app/actions';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PredictiveAnalysis } from './predictive-analysis';


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

const RecommendationCard = ({ recommendation, onActed, isActedOn }: { recommendation: DssRecommendation, onActed: () => void, isActedOn: boolean }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{recommendation.recommendation}</CardTitle>
          </div>
          <Badge variant="secondary">Priority: {recommendation.priority}</Badge>
        </div>
         <CardDescription>{recommendation.justification}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
         <Button onClick={onActed} disabled={isActedOn}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            {isActedOn ? 'Reviewed' : 'Mark as Reviewed'}
          </Button>
      </CardFooter>
    </Card>
  )
}

const VillageAnalysis = ({ villages, claims }: { villages: Village[], claims: Claim[] }) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<DssRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actedOn, setActedOn] = useState<string[]>([]);
  const [errorState, setErrorState] = useState<{title: string, description: string} | null>(null);
  const { toast } = useToast();

  const handleVillageChange = async (villageId: string) => {
    setSelectedVillageId(villageId);
    if (!villageId) {
      setRecommendations(null);
      setErrorState(null);
      return;
    }
    
    setIsLoading(true);
    setRecommendations(null);
    setErrorState(null);
    setActedOn([]);

    try {
      const result = await getDssRecommendation(villageId, claims);
      setRecommendations(result);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
        setErrorState({
            title: 'Service Unavailable',
            description: 'The AI recommendation service is currently overloaded. Please try again in a few moments.'
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Error getting recommendation',
            description: 'Could not fetch DSS recommendation for this village.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVillage = useMemo(() => {
    return villages.find(v => v.id === selectedVillageId) || null;
  }, [selectedVillageId, villages]);

  const villageClaims = useMemo(() => {
    if (!selectedVillage) return [];
    return claims.filter(c => c.linkedVillage === selectedVillage.name);
  }, [selectedVillage, claims]);

  const handleMarkAsActed = (recommendation: string) => {
    setActedOn(prev => [...prev, recommendation]);
    toast({
      title: "Recommendation Actioned",
      description: `The recommendation for "${recommendation}" has been marked as reviewed.`,
    })
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Village Selection</CardTitle>
            <CardDescription>Select a village to see DSS recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleVillageChange} value={selectedVillageId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a village" />
              </SelectTrigger>
              <SelectContent>
                {villages.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {selectedVillage && (
          <Card>
            <CardHeader>
              <CardTitle>Village Data</CardTitle>
              <CardDescription>Data used for the recommendation.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <p><strong>Total Claims:</strong> {villageClaims.length}</p>
                <p><strong>Pending Claims:</strong> {villageClaims.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length}</p>
                <p><strong>CFR Claims:</strong> {villageClaims.filter(c => c.claimType.value === 'CFR').length}</p>
                <p><strong>IFR Claims:</strong> {villageClaims.filter(c => c.claimType.value === 'IFR').length}</p>
                <p><strong>Water Coverage:</strong> {selectedVillage.assetCoverage.water}%</p>
                <p><strong>Forest Coverage:</strong> {selectedVillage.assetCoverage.forest}%</p>
                <p><strong>Agricultural Area:</strong> {selectedVillage.assetCoverage.agriculture}%</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>DSS Recommendations</CardTitle>
             <CardDescription>AI-powered recommendations based on village data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-start h-full p-6 space-y-4">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            
            {!isLoading && !recommendations && !errorState && (
                <div className="text-center flex-1 flex flex-col justify-center items-center"><Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Select a village to see recommendations.</p></div>
            )}
            
            {errorState && (
                 <div className="text-center flex-1 flex flex-col justify-center items-center w-full">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{errorState.title}</AlertTitle>
                      <AlertDescription>
                        {errorState.description}
                      </AlertDescription>
                    </Alert>
                </div>
            )}

            {!isLoading && !errorState && recommendations && recommendations.length === 0 && <div className="text-center flex-1 flex flex-col justify-center items-center"><CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" /><p className="text-muted-foreground">No specific recommendations triggered for this village based on current data.</p></div>}
            
            {recommendations && recommendations.length > 0 && (
                <div className="w-full space-y-4">
                  {recommendations.map(rec => (
                    <RecommendationCard 
                      key={rec.recommendation}
                      recommendation={rec}
                      onActed={() => handleMarkAsActed(rec.recommendation)}
                      isActedOn={actedOn.includes(rec.recommendation)}
                    />
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 26.5, lng: 82.4 });
  const [mapZoom, setMapZoom] = useState(9);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
    water: false,
    forest: false,
    agriculture: false,
  });
  const { toast } = useToast();


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

  const handleClaimLink = (claimToLink: Claim) => {
    setClaims(prev => prev.map(c => c.id === claimToLink.id ? { ...c, status: 'linked' } : c));
    toast({
        title: 'Claim Linked',
        description: `Claim for ${claimToLink.claimantName.value} is now visible on the map.`
    });
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
  const approvedClaims = claims.filter(c => c.status === 'linked').length;
  const totalVillages = VILLAGES.length;

  const linkedClaims = useMemo(() => claims.filter(c => c.status === 'linked'), [claims]);
  
  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Interactive Map</CardTitle>
                    <CardDescription>Explore claims and village boundaries</CardDescription>
                  </div>
                  <AssetLayersControl activeLayers={activeLayers} onActiveLayersChange={setActiveLayers} />
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                  <MapView
                    claims={linkedClaims}
                    villages={VILLAGES}
                    onVillageClick={() => {}}
                    onClaimEdit={handleClaimEdit}
                    center={mapCenter}
                    zoom={mapZoom}
                    activeLayers={activeLayers}
                  />
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
        return <ClaimsTable claims={claims} onClaimEdit={handleClaimEdit} onClaimLink={handleClaimLink} />;
      case 'village-analysis':
        return <VillageAnalysis villages={VILLAGES} claims={claims} />;
      case 'predictive-analysis':
        return <PredictiveAnalysis villages={VILLAGES} />;
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
            <StatsCard title="Pending Review" value={pendingClaims} icon={Clock} color="#f59e0b" />
            <StatsCard title="Linked to Map" value={approvedClaims} icon={CheckCircle} color="#10b981" />
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
