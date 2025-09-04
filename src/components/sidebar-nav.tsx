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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ClaimUpload } from '@/components/claim-upload';
import { WaterRiskChart } from '@/components/water-risk-chart';
import { FileText, Layers, Download, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Claim } from '@/types';

type SidebarNavProps = {
  claims: Claim[];
  onClaimAdded: (claim: Claim) => void;
  onClaimSelect: (claim: Claim) => void;
  onLayerToggle: (layer: 'ndwi' | 'ndvi', toggled: boolean) => void;
};

export function SidebarNav({ claims, onClaimAdded, onClaimSelect, onLayerToggle }: SidebarNavProps) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Generating report for selected claims...',
    });
    setTimeout(() => {
        toast({
            title: 'Export Complete',
            description: 'Your report is downloading.',
        });
    }, 2000);
  }

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
            <SidebarGroupLabel>Uploaded Claims ({claims.length})</SidebarGroupLabel>
            <SidebarMenu className="mt-2 max-h-64 overflow-y-auto pr-2">
              {claims.length === 0 && <p className="px-2 text-sm text-muted-foreground">No claims uploaded yet.</p>}
              {claims.map((claim) => (
                <SidebarMenuItem key={claim.id}>
                  <SidebarMenuButton onClick={() => onClaimSelect(claim)} size="lg" className="h-auto py-2">
                    <FileText />
                    <div className="flex flex-col items-start w-full">
                        <span className="font-medium">{claim.claimantName}</span>
                        <span className="text-xs text-muted-foreground">{claim.village}</span>
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
                    <Label htmlFor="ndwi-toggle">NDWI Overlay</Label>
                    <Switch id="ndwi-toggle" onCheckedChange={(c) => onLayerToggle('ndwi', c)} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="ndvi-toggle">NDVI Overlay</Label>
                    <Switch id="ndvi-toggle" onCheckedChange={(c) => onLayerToggle('ndvi', c)} />
                </div>
            </div>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter className="gap-4">
            <WaterRiskChart />
            <Button variant="outline" className="w-full" onClick={handleExport}>
                <Download className="mr-2" />
                Export Report
            </Button>
        </SidebarFooter>
      </Sidebar>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={onClaimAdded} />
    </>
  );
}
