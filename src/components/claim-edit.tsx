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
import { ConfidenceBadge } from './confidence-badge';

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
        setFormData(prev => ({ ...prev, [name]: value, geoLinkConfidence: 1.0 }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            [name]: { ...prev[name as keyof Claim], value: value, confidence: 1.0 } 
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

    // When a user manually reviews and saves, we can assume the confidence is now 100%
    if (isReviewAction) {
        updatedClaim.status = 'reviewed'; // Move to next state in workflow
        
        // Update all fields to 100% confidence since they've been manually reviewed
        updatedClaim.claimantName = { ...updatedClaim.claimantName, confidence: 1.0 };
        updatedClaim.village = { ...updatedClaim.village, value: updatedClaim.linkedVillage || updatedClaim.village.value, confidence: 1.0 };
        updatedClaim.claimType = { ...updatedClaim.claimType, confidence: 1.0 };
        updatedClaim.area = { ...updatedClaim.area, confidence: 1.0 };
        updatedClaim.date = { ...updatedClaim.date, confidence: 1.0 };
        updatedClaim.geoLinkConfidence = 1.0;
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isReviewAction ? 'Review and Finalize Claim' : 'Correct Claim Data'}</DialogTitle>
          <DialogDescription>
            {isReviewAction 
              ? 'The AI extraction has medium/low confidence. Please verify the fields below, correct any data, and finalize the review.'
              : "Review and correct the extracted data. Click save when you're done."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="claimantName" className="text-right">Claimant</Label>
            <Input id="claimantName" name="claimantName" value={formData.claimantName?.value || ''} onChange={handleInputChange} className="col-span-3" />
            <ConfidenceBadge score={claim.claimantName.confidence} />
          </div>
           <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="village" className="text-right">Village</Label>
            <Select name="linkedVillage" value={formData.linkedVillage || ''} onValueChange={handleSelectChange('linkedVillage')}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a village" />
                </SelectTrigger>
                <SelectContent>
                    {availableVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
            </Select>
            <ConfidenceBadge score={claim.geoLinkConfidence} />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
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
            <ConfidenceBadge score={claim.claimType.confidence} />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="area" className="text-right">Area</Label>
            <Input id="area" name="area" value={formData.area?.value || ''} onChange={handleInputChange} className="col-span-3" />
            <ConfidenceBadge score={claim.area.confidence} />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input id="date" name="date" value={formData.date?.value || ''} onChange={handleInputChange} className="col-span-3" />
            <ConfidenceBadge score={claim.date.confidence} />
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
