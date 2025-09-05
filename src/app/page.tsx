'use client';
import { useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header onMenuClick={() => setSidebarOpen(p => !p)} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
