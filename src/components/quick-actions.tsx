
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Upload, List, Search, FileJson } from 'lucide-react';
import { useRouter } from 'next/navigation';

type QuickActionsProps = {
    onUpload: () => void;
    onViewClaims: () => void;
    onUploadShapefile: () => void;
}

export function QuickActions({ onUpload, onViewClaims, onUploadShapefile }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={onUpload}>
            <div className="p-2 bg-green-100 rounded-md mr-3">
              <Upload className="h-5 w-5 text-green-700" />
            </div>
            <div>
                <p className="font-semibold">Upload New Claim</p>
                <p className="text-xs text-muted-foreground">Process PDF/JPG documents</p>
            </div>
        </Button>
        <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={() => router.push('/claims')}>
            <div className="p-2 bg-blue-100 rounded-md mr-3">
                <Search className="h-5 w-5 text-blue-700" />
            </div>
            <div>
                <p className="font-semibold">Search Claims</p>
                <p className="text-xs text-muted-foreground">Filter and review claims</p>
            </div>
        </Button>
         <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={onUploadShapefile}>
            <div className="p-2 bg-purple-100 rounded-md mr-3">
                <FileJson className="h-5 w-5 text-purple-700" />
            </div>
            <div>
                <p className="font-semibold">Upload Shapefile</p>
                <p className="text-xs text-muted-foreground">Import patta data</p>
            </div>
        </Button>
      </CardContent>
    </Card>
  );
}
