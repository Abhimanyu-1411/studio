'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarInput,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ClaimUpload } from '@/components/claim-upload';
import { WaterRiskChart } from '@/components/water-risk-chart';
import { FileText, Download, PlusCircle, Leaf, Droplets, LandPlot, Search, ArrowLeft, Loader2, FileDown, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Claim, Village, DssRecommendation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type SidebarNavProps = {
  claims: Claim[];
  onClaimAdded: (claim: Claim) => void;
  onClaimSelect: (claim: Claim) => void;
  onLayerToggle: (layer: string, toggled: boolean) => void;
  selectedVillage: Village | null;
  onVillageSelect: (village: Village | null) => void;
  dssRecommendation: DssRecommendation | null;
  isLoadingDss: boolean;
};

const claimTypeColors = {
  IFR: 'bg-green-500',
  CFR: 'bg-blue-500',
  CR: 'bg-orange-500',
  'default': 'bg-gray-500'
}

const claimStatusBadges = {
    linked: 'default',
    unlinked: 'destructive',
    'needs-review': 'secondary',
    reviewed: 'default',
}

const claimStatusText = {
    linked: 'Linked',
    unlinked: 'Unlinked',
    'needs-review': 'Needs Review',
    reviewed: 'Reviewed',
}

const getClaimTypeColor = (claimType: string) => {
    if (claimType in claimTypeColors) return claimTypeColors[claimType as keyof typeof claimTypeColors];
    return claimTypeColors.default;
}

const VillageDetailView = ({
    selectedVillage,
    claims,
    onVillageSelect,
    onClaimSelect,
    dssRecommendation,
    isLoadingDss,
    onPdfExport,
}: {
    selectedVillage: Village;
    claims: Claim[];
    onVillageSelect: (village: Village | null) => void;
    onClaimSelect: (claim: Claim) => void;
    dssRecommendation: DssRecommendation | null;
    isLoadingDss: boolean;
    onPdfExport: () => void;
}) => {
    const claimsInVillage = claims.filter(c => c.linkedVillage === selectedVillage.name);
    return (
     <div className="flex flex-col h-full">
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Button variant="ghost" onClick={() => onVillageSelect(null)} className="w-full justify-start">
                        <ArrowLeft /> Back to All Claims
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarContent className="p-2">
            <Card className="bg-transparent border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">{selectedVillage?.name}</CardTitle>
                    <CardDescription>Asset & Claim Overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">Decision Support</h4>
                         <div className="p-2 border rounded-lg bg-primary/5">
                            {isLoadingDss && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading recommendation...</div>}
                            {dssRecommendation && (
                                <div>
                                    <p className="text-sm font-semibold text-primary">{dssRecommendation.recommendation}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{dssRecommendation.justification}</p>
                                </div>
                            )}
                            {!isLoadingDss && !dssRecommendation && <p className="text-xs text-muted-foreground">No recommendations available.</p>}
                        </div>
                    </div>
                    <div>
                         <h4 className="font-semibold text-sm mb-2">Asset Coverage</h4>
                         <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-md bg-muted">
                                <Droplets className="mx-auto text-blue-500 mb-1" />
                                <p className="font-bold text-sm">{selectedVillage?.assetCoverage.water}%</p>
                                <p className="text-xs">Water</p>
                            </div>
                             <div className="p-2 rounded-md bg-muted">
                                <Leaf className="mx-auto text-green-600 mb-1" />
                                <p className="font-bold text-sm">{selectedVillage?.assetCoverage.forest}%</p>
                                <p className="text-xs">Forest</p>
                            </div>
                             <div className="p-2 rounded-md bg-muted">
                                <LandPlot className="mx-auto text-yellow-600 mb-1" />
                                <p className="font-bold text-sm">{selectedVillage?.assetCoverage.agriculture}%</p>
                                <p className="text-xs">Agriculture</p>
                            </div>
                         </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Claims in Village ({claimsInVillage.length})</h4>
                        <SidebarMenu className="mt-2 max-h-48 overflow-y-auto pr-2">
                          {claimsInVillage.length === 0 && <p className="px-2 text-sm text-muted-foreground">No claims linked to this village.</p>}
                          {claimsInVillage.map((claim) => (
                            <SidebarMenuItem key={claim.id}>
                              <SidebarMenuButton onClick={() => onClaimSelect(claim)} size="lg" className="h-auto py-2">
                                <FileText />
                                <div className="flex flex-col items-start w-full">
                                    <span className="font-medium">{claim.claimantName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${getClaimTypeColor(claim.claimType)}`}></span>
                                        <span className="text-xs text-muted-foreground">{claim.area}</span>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="ml-auto">
                                  {claim.claimType}
                                </Badge>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                    </div>
                </CardContent>
            </Card>
        </SidebarContent>
        <SidebarFooter>
             <Button variant="outline" className="w-full" onClick={onPdfExport}>
                <FileDown className="mr-2" />
                Download PDF Report
            </Button>
        </SidebarFooter>
    </div>
  )
}

const GlobalView = ({
    claims,
    onClaimSelect,
    onLayerToggle,
    setUploadOpen,
    handleExport,
}: {
    claims: Claim[];
    onClaimSelect: (claim: Claim) => void;
    onLayerToggle: (layer: string, toggled: boolean) => void;
    setUploadOpen: (open: boolean) => void;
    handleExport: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredClaims = claims.filter(claim =>
        claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className="w-full" onClick={() => setUploadOpen(true)}>
              <PlusCircle className="mr-2" />
              Upload New Claim
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Uploaded Claims ({filteredClaims.length})</SidebarGroupLabel>
          <div className="relative p-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <SidebarInput 
                  placeholder="Search claims..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <SidebarMenu className="mt-2 max-h-60 overflow-y-auto pr-2">
            {claims.length > 0 && filteredClaims.length === 0 && <p className="px-2 text-sm text-muted-foreground">No claims match your search.</p>}
            {claims.length === 0 && <p className="px-2 text-sm text-muted-foreground">No claims uploaded yet.</p>}
            {filteredClaims.map((claim) => (
              <SidebarMenuItem key={claim.id}>
                <SidebarMenuButton onClick={() => onClaimSelect(claim)} size="lg" className="h-auto py-2">
                  <FileText />
                  <div className="flex flex-col items-start w-full">
                      <span className="font-medium">{claim.claimantName}</span>
                      <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${getClaimTypeColor(claim.claimType)}`}></span>
                          <span className="text-xs text-muted-foreground">{claim.village}</span>
                      </div>
                  </div>
                  <Badge variant={claimStatusBadges[claim.status] as any} className="ml-auto">
                    {claimStatusText[claim.status]}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Asset Layers</SidebarGroupLabel>
          <div className="flex flex-col gap-4 p-2">
              <div className="flex items-center justify-between">
                  <Label htmlFor="ndwi-toggle" className="flex items-center gap-2"><Droplets className="text-blue-500" />NDWI Overlay</Label>
                  <Switch id="ndwi-toggle" onCheckedChange={(c) => onLayerToggle('ndwi', c)} />
              </div>
              <div className="flex items-center justify-between">
                  <Label htmlFor="water-toggle" className="flex items-center gap-2"><Waves className="text-cyan-500" />Water Bodies</Label>
                  <Switch id="water-toggle" onCheckedChange={(c) => onLayerToggle('water', c)} />
              </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="forest-toggle" className="flex items-center gap-2"><Leaf className="text-green-600" />Forest Cover</Label>
                  <Switch id="forest-toggle" onCheckedChange={(c) => onLayerToggle('forest', c)} />
              </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="agriculture-toggle" className="flex items-center gap-2"><LandPlot className="text-yellow-600"/>Agricultural Areas</Label>
                  <Switch id="agriculture-toggle" onCheckedChange={(c) => onLayerToggle('agriculture', c)} />
              </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-4">
        <WaterRiskChart />
        <Button variant="outline" className="w-full" onClick={handleExport}>
            <Download className="mr-2" />
            Export Report as CSV
        </Button>
      </SidebarFooter>
    </>
  )
}


export function SidebarNav({ 
  claims, 
  onClaimAdded, 
  onClaimSelect, 
  onLayerToggle, 
  selectedVillage, 
  onVillageSelect,
  dssRecommendation,
  isLoadingDss 
}: SidebarNavProps) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (claims.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No claims to export',
        description: 'Please upload at least one claim before exporting.',
      });
      return;
    }
    const csvHeader = "ClaimID,ClaimantName,Village,ClaimType,Area,Date,Status,LinkedVillage,Confidence\n";
    const csvRows = claims.map(c => 
        `${c.id},"${c.claimantName}","${c.village}","${c.claimType}","${c.area}","${c.date}",${c.status},${c.linkedVillage || ''},${c.confidenceScore || 0}`
    ).join("\n");
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `claims_export_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export Complete',
      description: 'Your new CSV report is downloading.',
    });
  }

  const handlePdfExport = () => {
    toast({
      title: 'PDF Export (Not Implemented)',
      description: 'This feature is not yet available.',
    });
  };
  
  return (
    <>
      <Sidebar>
        { selectedVillage ? (
            <VillageDetailView 
                selectedVillage={selectedVillage}
                claims={claims}
                onVillageSelect={onVillageSelect}
                onClaimSelect={onClaimSelect}
                dssRecommendation={dssRecommendation}
                isLoadingDss={isLoadingDss}
                onPdfExport={handlePdfExport}
            />
        ) : (
            <GlobalView 
                claims={claims}
                onClaimSelect={onClaimSelect}
                onLayerToggle={onLayerToggle}
                setUploadOpen={setUploadOpen}
                handleExport={handleExport}
            />
        )}
      </Sidebar>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={onClaimAdded} />
    </>
  );
}
