
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Menu } from 'lucide-react';
import { ClaimUpload } from './claim-upload';
import { useState } from 'react';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  
  return (
    <>
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      <div className="flex items-center gap-2 ml-auto">
        <Button onClick={() => setUploadOpen(true)} className="flex">
          <Upload className="mr-2 h-4 w-4" />
          Upload Claim
        </Button>
      </div>
    </header>
    <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={() => {
        // This needs to be connected to the main state in dashboard
    }}/>
    </>
  );
}
