
'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(p => !p)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
