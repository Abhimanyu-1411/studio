
'use client';

import { useState, useCallback, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, FileCheck2, XCircle, MapPin, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Village, CommunityAsset, Claim, LngLat } from '@/types';

type AssetEditProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetAdded: (asset: Omit<CommunityAsset, 'id'>) => void;
  villages: Village[];
  claimLocation?: Claim['location'];
  preselectedVillageName?: string;
};

const assetTypes = [
  { value: 'water', label: 'Water Body' },
  { value: 'forest', label: 'Forest Area' },
  { value: 'agriculture', label: 'Agricultural Land' },
  { value: 'school', label: 'School' },
  { value: 'other', label: 'Other' },
];

// Helper to generate a regular polygon from a LngLat center
const createPolygon = (center: LngLat, sides: number, radiusDegrees: number): LngLat[] => {
    const [lng, lat] = center;
    const coords: LngLat[] = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * 2 * Math.PI;
        const pointLng = lng + radiusDegrees * Math.sin(angle);
        const pointLat = lat + radiusDegrees * Math.cos(angle);
        coords.push([pointLng, pointLat]);
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
};

export function AssetEdit({ open, onOpenChange, onAssetAdded, villages, claimLocation, preselectedVillageName }: AssetEditProps) {
  const [villageId, setVillageId] = useState('');
  const [assetType, setAssetType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open && preselectedVillageName) {
        const village = villages.find(v => v.name === preselectedVillageName);
        if (village) {
            setVillageId(village.id);
        }
    }
  }, [open, preselectedVillageName, villages]);

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
      setProgress(33);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStatus('idle');
        setProgress(66);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const resetState = () => {
    setVillageId('');
    setAssetType('');
    setDescription('');
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setProgress(0);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!villageId || !assetType || !description || !file || !preview) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields and upload a document.' });
      return;
    }

    setStatus('processing');
    setProgress(80);

    const selectedVillage = villages.find(v => v.id === villageId);
    
    // Determine the center for the new asset
    let center: LngLat | undefined;
    if (claimLocation?.value) {
        center = [claimLocation.value.lng, claimLocation.value.lat];
    } else if (selectedVillage?.center) {
        center = selectedVillage.center;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

    const placeholderGeometry = center ? createPolygon(center, 20, 0.001) : [];

    const newAsset: Omit<CommunityAsset, 'id'> = {
      villageId,
      assetType,
      description,
      documentUrl: preview,
      documentType: file.type,
      geometry: placeholderGeometry
    };

    onAssetAdded(newAsset);
    setStatus('success');
    setProgress(100);
    toast({
      title: 'Asset Added',
      description: 'The new community asset has been saved.',
    });
    setTimeout(() => handleClose(false), 1000);
  };

  const isProcessing = status === 'reading' || status === 'processing';
  const isFormSubmittable = villageId && assetType && description && file;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Community Asset</DialogTitle>
          <DialogDescription>
            Define a new community asset and provide a verification document. The next step will be to draw it on the map.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="villageId">Village</Label>
              <Select value={villageId} onValueChange={setVillageId}>
                <SelectTrigger id="villageId">
                  <SelectValue placeholder="Select a village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assetType">Asset Type</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger id="assetType">
                  <SelectValue placeholder="Select an asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(at => <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the asset, its location, and significance."
              />
            </div>
          </div>
          
          {/* File Upload */}
          <div className="space-y-4">
            <Label>Verification Document</Label>
            {!file ? (
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
                <p className="text-xs text-muted-foreground">Image or PDF (max 5MB)</p>
              </div>
            ) : (
              <div className="space-y-2">
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
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreview(null); setProgress(0); }} className="shrink-0">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                {(isProcessing || status === 'success') && <Progress value={progress} className="w-full" />}
                {status === 'success' && <p className="text-sm text-green-600 flex items-center gap-2"><FileCheck2 /> Asset information saved.</p>}
                {status === 'error' && <p className="text-sm text-destructive flex items-center gap-2"><XCircle /> Error processing file.</p>}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isFormSubmittable || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Save & Continue to Map
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
