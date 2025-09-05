
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle } from 'lucide-react';
import type { CommunityAsset, Village } from '@/types';
import Image from 'next/image';

type CommunityAssetsProps = {
  assets: CommunityAsset[];
  villages: Village[];
  onAddAsset: () => void;
};

export function CommunityAssets({ assets, villages, onAddAsset }: CommunityAssetsProps) {
  const getVillageName = (villageId: string) => {
    return villages.find(v => v.id === villageId)?.name || 'Unknown Village';
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Community Assets</CardTitle>
          <CardDescription>
            A list of user-defined community assets with verification documents.
          </CardDescription>
        </div>
        <Button onClick={onAddAsset}>
          <PlusCircle className="mr-2" />
          Add New Asset
        </Button>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <LandPlot className="mx-auto h-12 w-12" />
            <p className="mt-4">No community assets have been added yet.</p>
            <Button variant="link" onClick={onAddAsset} className="mt-2">Add the first asset</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader>
                    {asset.documentUrl && asset.documentType.startsWith('image') ? (
                        <Image 
                            src={asset.documentUrl} 
                            alt={asset.description} 
                            width={300} 
                            height={200}
                            className="rounded-t-lg object-cover w-full aspect-video"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full aspect-video bg-muted rounded-t-lg">
                            <LandPlot className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold capitalize">{asset.assetType.replace('_', ' ')}</h3>
                  <p className="text-sm text-muted-foreground">{getVillageName(asset.villageId)}</p>
                  <p className="text-sm mt-2">{asset.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
