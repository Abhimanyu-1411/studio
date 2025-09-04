'use client';

import { useState } from 'react';
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
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleClaimUpload } from '@/app/actions';
import type { Claim } from '@/types';

type ClaimUploadProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimAdded: (claim: Claim) => void;
};

export function ClaimUpload({ open, onOpenChange, onClaimAdded }: ClaimUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For PDFs, we just show a placeholder
        setPreview('https://picsum.photos/seed/pdf/400/300');
      }
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setIsUploading(false);
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result as string;
        
        const extractedData = await handleClaimUpload(base64File);

        const randomLocation = {
            lat: 26.5 + (Math.random() - 0.5) * 0.5,
            lng: 82.4 + (Math.random() - 0.5) * 0.8
        };
        
        const newClaim: Claim = {
          id: `claim-${Date.now()}`,
          ...extractedData,
          documentUrl: preview || '',
          documentType: file.type,
          status: extractedData.linkedVillage ? 'linked' : 'unlinked',
          location: randomLocation
        };

        onClaimAdded(newClaim);
        toast({
          title: 'Claim Processed',
          description: `Extracted data for ${newClaim.claimantName}.`,
        });
        handleClose(false);
      };
      reader.onerror = (error) => {
         throw new Error("Could not read file");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not extract data from the document.',
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Claim Document</DialogTitle>
          <DialogDescription>
            Select a PDF or image file to automatically extract claim details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="claim-document">Document</Label>
            <Input id="claim-document" type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
          </div>
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              <Image
                src={preview}
                alt="Document preview"
                width={400}
                height={300}
                className="rounded-md object-cover"
                data-ai-hint="document preview"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
                <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload & Extract
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
