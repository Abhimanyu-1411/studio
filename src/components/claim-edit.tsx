
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

type FormData = Omit<Claim, 'id' | 'created_at' | 'confidenceScores'>;

export function ClaimEdit({ claim, onClose, onClaimUpdate, availableVillages }: ClaimEditProps) {
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (claim) {
      setFormData(claim);
    }
  }, [claim]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: value
    }));
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData(prev => ({ 
        ...prev, 
        [name]: value
    }));
  }

  const handleSubmit = async () => {
    if (!claim) return;
    setIsSaving(true);
    
    const isReviewAction = claim.status === 'needs-review';

    // Create a new confidenceScores object where all values are 1.0
    const newConfidenceScores = { ...claim.confidenceScores };
    for (const key in newConfidenceScores) {
      if (Object.prototype.hasOwnProperty.call(newConfidenceScores, key)) {
        (newConfidenceScores as any)[key] = 1.0;
      }
    }

    const updatedClaim: Claim = {
        ...(claim as Claim), // Cast to ensure all properties are there
        ...formData, // Apply the changes from the form
        confidenceScores: isReviewAction ? newConfidenceScores : claim.confidenceScores, // Update scores only on review
        status: isReviewAction ? 'reviewed' : claim.status, // Update status only on review
    };
    
    onClaimUpdate(updatedClaim);
    setIsSaving(false);
    toast({
        title: isReviewAction ? 'Claim Reviewed' : 'Claim Updated',
        description: `Successfully updated claim for ${updatedClaim.claimantName}.`
    });
    onClose();
  };

  if (!claim) return null;

  const isReviewAction = claim.status === 'needs-review';
  const isDocumentImage = claim.documentType?.startsWith('image/');
  
  const getConfidence = (field: keyof Claim['confidenceScores']) => {
    return claim.confidenceScores ? claim.confidenceScores[field] : 0;
  }

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
            <div className="border rounded-lg bg-muted/20 p-2 h-[25vh] flex flex-col">
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
                    <Input id="claimantName" name="claimantName" value={formData.claimantName || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('claimantName')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="pattaNumber" className="text-right col-span-1">Patta Number</Label>
                    <Input id="pattaNumber" name="pattaNumber" value={formData.pattaNumber || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('pattaNumber')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="extentOfForestLandOccupied" className="text-right col-span-1">Extent Of Forest Land Occupied</Label>
                    <Input id="extentOfForestLandOccupied" name="extentOfForestLandOccupied" value={formData.extentOfForestLandOccupied || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('extentOfForestLandOccupied')} />
                </div>
                 <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="village" className="text-right col-span-1">Village</Label>
                    <Select name="village" value={formData.village || ''} onValueChange={handleSelectChange('village')}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a village" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <ConfidenceBadge score={getConfidence('village')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="gramPanchayat" className="text-right col-span-1">Gram Panchayat</Label>
                    <Input id="gramPanchayat" name="gramPanchayat" value={formData.gramPanchayat || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('gramPanchayat')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="tehsilTaluka" className="text-right col-span-1">Tehsil Taluka</Label>
                    <Input id="tehsilTaluka" name="tehsilTaluka" value={formData.tehsilTaluka || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('tehsilTaluka')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="district" className="text-right col-span-1">District</Label>
                    <Input id="district" name="district" value={formData.district || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('district')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="state" className="text-right col-span-1">State</Label>
                    <Input id="state" name="state" value={formData.state || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('state')} />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="date" className="text-right col-span-1">Date</Label>
                    <Input id="date" name="date" value={formData.date || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('date')} />
                </div>
                <div key="claimType" className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="claimType" className="text-right col-span-1">Claim Type</Label>
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
                    <ConfidenceBadge score={getConfidence('claimType')} />
                </div>
                 <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="address" className="text-right col-span-1">Address</Label>
                    <Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} className="col-span-3" />
                    <ConfidenceBadge score={getConfidence('address')} />
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

    