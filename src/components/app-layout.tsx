
'use client';
import { Header } from '@/components/header';
import type { Claim } from '@/types';

export function AppLayout({ children, onClaimAdded }: { children: React.ReactNode, onClaimAdded?: (claim: Claim) => void; }) {

  return (
    <>
      <Header onClaimAdded={onClaimAdded} />
      <main className="relative z-1 flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </>
  );
}
