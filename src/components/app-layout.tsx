
'use client';
import { Header } from '@/components/header';

export function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <Header />
      <main className="relative z-1 flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </>
  );
}
