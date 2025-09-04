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
import { FileText, Download, PlusCircle, Leaf, Droplets, LandPlot, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Claim } from '@/types';

type SidebarNavProps = {
  claims: Claim[];
  onClaimAdded: (claim: Claim) => void;
  onClaimSelect: (claim: Claim) => void;
  onLayerToggle: (layer: string, toggled: boolean) => void;
};

const claimTypeColors = {
  IFR: 'bg-green-500',
  CFR: 'bg-blue-500',
  CR: 'bg-orange-500',
  'default': 'bg-gray-500'
}

export function SidebarNav({ claims, onClaimAdded, onClaimSelect, onLayerToggle }: SidebarNavProps) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const getClaimTypeColor = (claimType: string) => {
    if (claimType in claimTypeColors) return claimTypeColors[claimType as keyof typeof claimTypeColors];
    return claimTypeColors.default;
  }

  const filteredClaims = claims.filter(claim =>
    claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Sidebar>
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
                    <Badge variant={claim.status === 'linked' ? 'default' : 'secondary'} className="ml-auto">
                      {claim.status}
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
      </Sidebar>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={onClaimAdded} />
    </>
  );
}
