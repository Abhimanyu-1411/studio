
'use client';

import { useState, useCallback } from 'react';
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
import { Loader2, UploadCloud, FileCheck2, XCircle, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleClaimUpload } from '@/app/actions';
import type { Claim } from '@/types';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ClaimUploadProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimAdded: (claim: Claim) => void;
};

export function ClaimUpload({ open, onOpenChange, onClaimAdded }: ClaimUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
        });
        return;
      }
      setFile(selectedFile);
      setStatus('reading');
      setProgress(20);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStatus('idle');
        setProgress(40);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setProgress(0);
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  const handleSubmit = async () => {
    if (!file || !preview) return;

    setStatus('uploading');
    setProgress(60);

    try {
      const newClaim = await handleClaimUpload(preview, file.type);
      setProgress(80);
      
      onClaimAdded(newClaim);
      setStatus('success');
      setProgress(100);
      toast({
        title: 'Claim Processed',
        description: `Extracted data for ${newClaim.claimantName.value}.`,
      });
      setTimeout(() => handleClose(false), 1000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setStatus('error');
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          toast({
              variant: 'destructive',
              title: 'AI Service Unavailable',
              description: 'The AI model is currently overloaded. Please try again in a few moments.',
          });
      } else {
          toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: 'Could not extract data from the document.',
          });
      }
    }
  };
  
  const isProcessing = status === 'reading' || status === 'uploading';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Claim Document</DialogTitle>
          <DialogDescription>
            Drag and drop a PDF/JPG file or click to select a file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          {!file && (
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted',
                isDragActive ? 'border-primary bg-muted' : 'border-input'
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive ? 'Drop the file here...' : "Drag 'n' drop a file, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, JPG (max 5MB)</p>
            </div>
          )}

          {file && (
            <div className="mt-4 space-y-4">
               <div className="flex items-center gap-4 p-2 border rounded-md">
                {preview && file.type.startsWith('image/') ? (
                    <Image
                        src={preview}
                        alt="Document preview"
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                    />
                ) : (
                    <div className="h-[50px] w-[50px] flex items-center justify-center bg-muted rounded-md">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
                  <div className="flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetState} className="shrink-0">
                      <XCircle className="h-4 w-4" />
                  </Button>
               </div>

              {(isProcessing || status === 'success') && <Progress value={progress} className="w-full" />}
              
              {status === 'success' && <p className="text-sm text-green-600 flex items-center gap-2"><FileCheck2/> Success! Claim data extracted.</p>}
              {status === 'error' && <p className="text-sm text-destructive flex items-center gap-2"><XCircle/> Error processing file.</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || isProcessing || status === 'success'}>
            {status === 'uploading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : status === 'success' ? 'Done' : (
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
