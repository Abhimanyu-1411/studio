
'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className={cn("flex flex-col sm:gap-4 sm:py-4 sm:pl-14")}>
        <Header onMenuClick={() => setSidebarOpen(p => !p)} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
