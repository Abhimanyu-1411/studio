'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Upload, List, UserPlus } from 'lucide-react';

type QuickActionsProps = {
    onUpload: () => void;
    onViewClaims: () => void;
}

export function QuickActions({ onUpload, onViewClaims }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="outline" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload a new claim
        </Button>
         <Button variant="outline" onClick={onViewClaims}>
            <List className="mr-2 h-4 w-4" />
            View all claims
        </Button>
         <Button variant="outline" disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Add new user (Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
