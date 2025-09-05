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
import { Loader2, Link, Save, CheckCircle } from 'lucide-react';

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
    setFormData(prev => ({ 
        ...prev, 
        [name]: { ...prev[name as keyof Claim], value: value } 
    }));
  };

  const handleSelectChange = (name: keyof Claim) => (value: string) => {
    if (name === 'linkedVillage') {
        setFormData(prev => ({ ...prev, [name]: value }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            [name]: { ...prev[name as keyof Claim], value: value } 
        }));
    }
  }

  const handleSubmit = async () => {
    if (!claim) return;
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isReviewAction = claim.status === 'needs-review';

    let updatedClaim: Claim = {
        ...claim,
        ...formData,
        status: claim.status, // Keep original status unless changed by action
    };

    if (isReviewAction) {
        updatedClaim.status = 'reviewed';
        updatedClaim.geoLinkConfidence = 1.0;
        if (updatedClaim.linkedVillage) {
            updatedClaim.village = { value: updatedClaim.linkedVillage, confidence: 1.0 };
        }
    }
    
    onClaimUpdate(updatedClaim);
    setIsSaving(false);
    toast({
        title: isReviewAction ? 'Claim Reviewed' : 'Claim Updated',
        description: `Successfully updated claim for ${updatedClaim.claimantName.value}.`
    });
    onOpenChange(false);
  };

  if (!claim) return null;

  const isReviewAction = claim.status === 'needs-review';

  return (
    <Dialog open={!!claim} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isReviewAction ? 'Review and Finalize Claim' : 'Correct Claim Data'}</DialogTitle>
          <DialogDescription>
            {isReviewAction 
              ? 'The AI link has low confidence. Please verify the village and correct any data. After reviewing, you can link it from the claims list.'
              : "Review and correct the extracted data. Click save when you're done."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimantName" className="text-right">Claimant</Label>
            <Input id="claimantName" name="claimantName" value={formData.claimantName?.value || ''} onChange={handleInputChange} className="col-span-3" />
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
             <Select name="claimType" value={formData.claimType?.value || ''} onValueChange={handleSelectChange('claimType')}>
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
            <Input id="area" name="area" value={formData.area?.value || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input id="date" name="date" value={formData.date?.value || ''} onChange={handleInputChange} className="col-span-3" />
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
            ) : isReviewAction ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Review & Finalize
              </>
            ) : (
               <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
               </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
