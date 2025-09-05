
'use client';
import { useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
