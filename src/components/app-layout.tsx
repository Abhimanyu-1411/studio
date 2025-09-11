
'use client';
import { useState, useEffect }from 'react';
import { Header } from '@/components/header';
import { ClaimUpload } from '@/components/claim-upload';
import type { Claim } from '@/types';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [animationKey, setAnimationKey] = useState(pathname);

  useEffect(() => {
    if (pathname !== animationKey) {
      setAnimationKey(pathname);
    }
  }, [pathname, animationKey]);

  
  const handleClaimAdded = (claim: Claim) => {
    // For now, just refresh the router to refetch data on the current page.
    // This is a simple way to update lists on pages like /claims.
    // A more advanced implementation might use a global state manager.
    router.refresh();
  }

  return (
    <>
      <Header onUploadClick={() => setUploadOpen(true)} />
      <main 
        key={animationKey}
        className={cn(
          "flex-1 bg-muted/40 p-4 sm:p-6 md:p-8 animate-in fade-in-50 duration-500",
          isUploadOpen && "blur-sm"
        )}
      >
        {children}
      </main>
      <ClaimUpload 
        open={isUploadOpen} 
        onOpenChange={setUploadOpen} 
        onClaimAdded={handleClaimAdded}
      />
    </>
  );
}
