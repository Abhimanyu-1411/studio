
'use client';
import { Header } from '@/components/header';

export function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        {children}
      </main>
    </>
  );
}
