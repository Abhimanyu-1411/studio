
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Loader2, Save, CheckCircle } from 'lucide-react';
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
  const isDocumentImage = claim.documentType.startsWith('image/');

  return (
    <Dialog open={!!claim} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isReviewAction ? 'Review and Finalize Claim' : 'Correct Claim Data'}</DialogTitle>
          <DialogDescription>
            {isReviewAction 
              ? 'The AI extraction has medium/low confidence. Verify the fields below against the document, correct any data, and finalize the review.'
              : "Review and correct the extracted data. Click save when you're done."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-8 py-4">
            {/* Document Preview Column */}
            <div className="border rounded-lg bg-muted/20 p-2 h-[50vh] md:h-[60vh] flex flex-col">
                <Label className="text-center pb-2">Document Preview</Label>
                <div className="flex-1 w-full h-full">
                {claim.documentUrl ? (
                  isDocumentImage ? (
                      <Image 
                          src={claim.documentUrl} 
                          alt="Claim document" 
                          width={500} 
                          height={700}
                          className="object-contain w-full h-full"
                      />
                  ) : (
                      <iframe src={claim.documentUrl} className="w-full h-full" title="Claim Document" />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No document preview available.</p>
                  </div>
                )}
                </div>
            </div>

            {/* Form Fields Column */}
            <div className="space-y-4">
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="claimantName" className="text-right col-span-1">Claimant</Label>
                    <Input id="claimantName" name="claimantName" value={formData.claimantName?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={claim.claimantName.confidence} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="village" className="text-right col-span-1">Village</Label>
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
                    <Label htmlFor="claimType" className="text-right col-span-1">Claim Type</Label>
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
                    <Label htmlFor="area" className="text-right col-span-1">Area</Label>
                    <Input id="area" name="area" value={formData.area?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={claim.area.confidence} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="date" className="text-right col-span-1">Date</Label>
                    <Input id="date" name="date" value={formData.date?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={claim.date.confidence} />
                </div>
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
