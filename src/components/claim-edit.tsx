
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
import { Textarea } from './ui/textarea';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldData = formData[name as keyof Claim] as { value: string; confidence: number };
    setFormData(prev => ({ 
        ...prev, 
        [name]: { ...fieldData, value: value } 
    }));
  };

  const handleSelectChange = (name: keyof Claim) => (value: string) => {
    const fieldData = formData[name as keyof Claim] as { value: string; confidence: number };
    setFormData(prev => ({ 
        ...prev, 
        [name]: { ...fieldData, value: value, confidence: 1.0 } 
    }));
  }

  const handleSubmit = async () => {
    if (!claim) return;
    setIsSaving(true);
    
    const isReviewAction = claim.status === 'needs-review';

    const updatedClaim: Claim = {
        ...(claim as Claim), // Cast to ensure all properties are there
        ...formData, // Apply the changes from the form
    };

    if (isReviewAction) {
        updatedClaim.status = 'reviewed';
        // When reviewing, boost confidence of all fields to 100% as they are manually verified
        for (const key in updatedClaim) {
            if (Object.prototype.hasOwnProperty.call(updatedClaim, key)) {
                const prop = (updatedClaim as any)[key];
                if (prop && typeof prop === 'object' && 'confidence' in prop) {
                    prop.confidence = 1.0;
                }
            }
        }
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

  const getFieldValue = (field: any) => field?.value ?? '';
  const getFieldConfidence = (field: any) => field?.confidence;

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
                    <Label htmlFor="claimantName" className="text-right col-span-1">Claimant Name</Label>
                    <Input id="claimantName" name="claimantName" value={getFieldValue(formData.claimantName)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.claimantName)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="pattaNumber" className="text-right col-span-1">Patta Number</Label>
                    <Input id="pattaNumber" name="pattaNumber" value={getFieldValue(formData.pattaNumber)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.pattaNumber)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="extentOfForestLandOccupied" className="text-right col-span-1">Extent Of Forest Land Occupied</Label>
                    <Input id="extentOfForestLandOccupied" name="extentOfForestLandOccupied" value={getFieldValue(formData.extentOfForestLandOccupied)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.extentOfForestLandOccupied)} />
                </div>
                 <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="village" className="text-right col-span-1">Village</Label>
                    <Select name="village" value={getFieldValue(formData.village)} onValueChange={handleSelectChange('village')}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a village" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <ConfidenceBadge score={getFieldConfidence(formData.village)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="gramPanchayat" className="text-right col-span-1">Gram Panchayat</Label>
                    <Input id="gramPanchayat" name="gramPanchayat" value={getFieldValue(formData.gramPanchayat)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.gramPanchayat)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="tehsilTaluka" className="text-right col-span-1">Tehsil Taluka</Label>
                    <Input id="tehsilTaluka" name="tehsilTaluka" value={getFieldValue(formData.tehsilTaluka)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.tehsilTaluka)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="district" className="text-right col-span-1">District</Label>
                    <Input id="district" name="district" value={getFieldValue(formData.district)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.district)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="state" className="text-right col-span-1">State</Label>
                    <Input id="state" name="state" value={getFieldValue(formData.state)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.state)} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="date" className="text-right col-span-1">Date</Label>
                    <Input id="date" name="date" value={getFieldValue(formData.date)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.date)} />
                </div>
                <div key="claimType" className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="claimType" className="text-right col-span-1">Claim Type</Label>
                    <Select name="claimType" value={getFieldValue(formData.claimType)} onValueChange={handleSelectChange('claimType')}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IFR">IFR</SelectItem>
                            <SelectItem value="CFR">CFR</SelectItem>
                            <SelectItem value="CR">CR</SelectItem>
                        </SelectContent>
                    </Select>
                    <ConfidenceBadge score={getFieldConfidence(formData.claimType)} />
                </div>
                 <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="address" className="text-right col-span-1">Address</Label>
                    <Textarea id="address" name="address" value={getFieldValue(formData.address)} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getFieldConfidence(formData.address)} />
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

    
