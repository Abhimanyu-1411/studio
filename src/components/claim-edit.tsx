
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Claim } from '@/types';
import { Loader2, Save, CheckCircle, X } from 'lucide-react';
import { ConfidenceBadge } from './confidence-badge';

type ClaimEditProps = {
  claim: Claim | null;
  onClose: () => void;
  onClaimUpdate: (claim: Claim) => void;
  availableVillages: string[];
};

export function ClaimEdit({ claim, onClose, onClaimUpdate, availableVillages }: ClaimEditProps) {
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
    const fieldData = formData[name as keyof Claim] as { value: string; confidence: number };
    setFormData(prev => ({ 
        ...prev, 
        [name]: { ...fieldData, value: value } 
    }));
  };

  const handleSelectChange = (name: keyof Claim) => (value: string) => {
    if (name === 'linkedVillage') {
        setFormData(prev => ({ ...prev, [name]: value, geoLinkConfidence: 1.0 }));
    } else {
        const fieldData = formData[name as keyof Claim] as { value: string; confidence: number };
        setFormData(prev => ({ 
            ...prev, 
            [name]: { ...fieldData, value: value, confidence: 1.0 } 
        }));
    }
  }

  const handleSubmit = async () => {
    if (!claim) return;
    setIsSaving(true);
    
    const isReviewAction = claim.status === 'needs-review';

    let updatedClaim: Claim = {
        ...claim,
        ...formData,
        claimantName: { ...claim.claimantName, ...(formData.claimantName as any) },
        village: { ...claim.village, ...(formData.village as any) },
        claimType: { ...claim.claimType, ...(formData.claimType as any) },
        area: { ...claim.area, ...(formData.area as any) },
        date: { ...claim.date, ...(formData.date as any) },
        status: claim.status,
    };

    if (isReviewAction) {
        updatedClaim.status = 'reviewed';
        (updatedClaim.claimantName as any).confidence = 1.0;
        (updatedClaim.village as any).confidence = 1.0;
        (updatedClaim.claimType as any).confidence = 1.0;
        (updatedClaim.area as any).confidence = 1.0;
        (updatedClaim.date as any).confidence = 1.0;
        updatedClaim.geoLinkConfidence = 1.0;
    }
    
    onClaimUpdate(updatedClaim);
    setIsSaving(false);
    toast({
        title: isReviewAction ? 'Claim Reviewed' : 'Claim Updated',
        description: `Successfully updated claim for ${(updatedClaim.claimantName as any).value}.`
    });
    onClose();
  };

  if (!claim) return null;

  const isReviewAction = claim.status === 'needs-review';
  const isDocumentImage = claim.documentType?.startsWith('image/');

  return (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>{isReviewAction ? 'Review Claim' : 'Correct Claim Data'}</CardTitle>
              <CardDescription>
                {isReviewAction 
                  ? 'Verify the extracted fields and finalize.'
                  : "Correct any inaccuracies in the data."
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="border rounded-lg bg-muted/20 p-2 h-[35vh] flex flex-col">
                <Label className="text-center pb-2">Document Preview</Label>
                <div className="relative flex-1 w-full h-full">
                {claim.documentUrl ? (
                  isDocumentImage ? (
                      <Image 
                          src={claim.documentUrl} 
                          alt="Claim document" 
                          fill
                          className="object-contain"
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

            <div className="space-y-4">
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="claimantName" className="text-right col-span-1">Claimant</Label>
                    <Input id="claimantName" name="claimantName" value={(formData.claimantName as any)?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={(claim.claimantName as any).confidence} />
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
                    <Select name="claimType" value={(formData.claimType as any)?.value || ''} onValueChange={handleSelectChange('claimType')}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IFR">IFR</SelectItem>
                            <SelectItem value="CFR">CFR</SelectItem>
                            <SelectItem value="CR">CR</SelectItem>
                        </SelectContent>
                    </Select>
                    <ConfidenceBadge score={(claim.claimType as any).confidence} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="area" className="text-right col-span-1">Area</Label>
                    <Input id="area" name="area" value={(formData.area as any)?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={(claim.area as any).confidence} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="date" className="text-right col-span-1">Date</Label>
                    <Input id="date" name="date" value={(formData.date as any)?.value || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={(claim.date as any).confidence} />
                </div>
            </div>
        </div>

        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
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
        </CardFooter>
    </Card>
  );
}
