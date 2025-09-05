
'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileCheck2, XCircle, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleShapefileUpload } from '@/app/actions';
import type { Patta } from '@/types';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ShapefileUploadProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPattasAdded: (pattas: Patta[]) => void;
};

export function ShapefileUpload({ open, onOpenChange, onPattasAdded }: ShapefileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
        });
        return;
      }
      setFile(selectedFile);
      setStatus('reading');
      setProgress(20);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDataUri(reader.result as string);
        setStatus('idle');
        setProgress(40);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
    multiple: false
  });

  const resetState = () => {
    setFile(null);
    setDataUri(null);
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
    if (!file || !dataUri) return;

    setStatus('uploading');
    setProgress(60);

    try {
      const newPattas = await handleShapefileUpload(dataUri);
      setProgress(80);
      
      onPattasAdded(newPattas);
      setStatus('success');
      setProgress(100);
      toast({
        title: 'Shapefile Processed',
        description: `Successfully extracted ${newPattas.length} patta records.`,
      });
      setTimeout(() => handleClose(false), 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: 'Could not extract patta data from the shapefile.',
      });
    }
  };
  
  const isProcessing = status === 'reading' || status === 'uploading';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Patta Shapefile</DialogTitle>
          <DialogDescription>
            Upload a .zip file containing the shapefile (.shp, .shx, .dbf). The AI will process it and display the pattas on the map.
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
                {isDragActive ? 'Drop the file here...' : "Drag 'n' drop a .zip file, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">Zipped Shapefile (max 10MB)</p>
            </div>
          )}

          {file && (
            <div className="mt-4 space-y-4">
               <div className="flex items-center gap-4 p-2 border rounded-md">
                 <FileJson className="h-10 w-10 text-muted-foreground" />
                  <div className="flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetState} className="shrink-0">
                      <XCircle className="h-4 w-4" />
                  </Button>
               </div>

              {(isProcessing || status === 'success') && <Progress value={progress} className="w-full" />}
              
              {status === 'success' && <p className="text-sm text-green-600 flex items-center gap-2"><FileCheck2/> Success! Data extracted.</p>}
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
                Upload & Process
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
