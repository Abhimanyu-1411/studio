
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Menu } from 'lucide-react';
import { ClaimUpload } from './claim-upload';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Map, Lightbulb, TrendingUp, LandPlot } from 'lucide-react';

type HeaderProps = {
  onMenuClick: () => void;
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
  { id: 'village-analysis', label: 'Village Analysis', icon: Lightbulb, href: '/analysis' },
  { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp, href: '/predictive' },
  { id: 'community-assets', label: 'Community Assets', icon: LandPlot, href: '/assets' },
];

export function Header({ onMenuClick }: HeaderProps) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
  }
  
  return (
    <>
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium mt-4">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.href)}
                            className={cn(
                                "flex items-center gap-4 px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg",
                                pathname === item.href && "bg-accent text-accent-foreground"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
      
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
