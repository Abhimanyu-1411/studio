'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Claim } from '@/types';
import { Loader2 } from 'lucide-react';

type ClaimEditProps = {
  claim: Claim | null;
  onOpenChange: (open: boolean) => void;
  onClaimUpdate: (claim: Claim) => void;
  availableVillages: string[];
};

export function ClaimEdit({ claim, onOpenChange, onClaimUpdate, availableVillages }: ClaimEditProps) {
  const [formData, setFormData] = useState<Partial<Claim>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (claim) {
      setFormData(claim);
    }
  }, [claim]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Claim) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async () => {
    if (!claim) return;
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedClaim: Claim = {
        ...claim,
        ...formData,
        status: 'reviewed',
        confidenceScore: 1.0, // Manually reviewed, so confidence is 100%
    };
    
    onClaimUpdate(updatedClaim);
    setIsSaving(false);
    toast({
        title: 'Claim Updated',
        description: `Successfully updated claim for ${updatedClaim.claimantName}.`
    });
    onOpenChange(false);
  };

  if (!claim) return null;

  return (
    <Dialog open={!!claim} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Correct Claim Data</DialogTitle>
          <DialogDescription>
            Review and correct the extracted data. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimantName" className="text-right">Claimant</Label>
            <Input id="claimantName" name="claimantName" value={formData.claimantName || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="village" className="text-right">Village</Label>
            <Select name="linkedVillage" value={formData.linkedVillage || ''} onValueChange={handleSelectChange('linkedVillage')}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a village" />
                </SelectTrigger>
                <SelectContent>
                    {availableVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimType" className="text-right">Claim Type</Label>
             <Select name="claimType" value={formData.claimType || ''} onValueChange={handleSelectChange('claimType')}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="IFR">IFR</SelectItem>
                    <SelectItem value="CFR">CFR</SelectItem>
                    <SelectItem value="CR">CR</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="area" className="text-right">Area</Label>
            <Input id="area" name="area" value={formData.area || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input id="date" name="date" value={formData.date || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
