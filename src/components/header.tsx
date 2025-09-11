
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Menu, LayoutGrid, List, MapPin as Map, Lightbulb, TrendingUp, LandPlot } from 'lucide-react';
import { ClaimUpload } from './claim-upload';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './icons';
import type { Claim } from '@/types';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
  { id: 'village-analysis', label: 'Village Analysis', icon: Lightbulb, href: '/analysis' },
  { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp, href: '/predictive' },
  { id: 'community-assets', label: 'Community Assets', icon: LandPlot, href: '/assets' },
];

export function Header({ onClaimAdded: onClaimAddedFromPage }: { onClaimAdded?: (claim: Claim) => void }) {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
    setSheetOpen(false);
  };
  
  const handleClaimAdded = (claim: Claim) => {
    // If the page (like the dashboard) provides a specific function to handle claim additions, use it.
    if (onClaimAddedFromPage) {
      onClaimAddedFromPage(claim);
    } else {
      // Otherwise, just refresh the page data. This is useful for pages like /claims.
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-24 items-center gap-4 border-b bg-primary px-4 text-primary-foreground sm:px-6">
        {/* Mobile Nav */}
        <div className="sm:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="text-primary-foreground bg-primary hover:bg-primary/90">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <SheetHeader>
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>
                            Select a page to navigate to.
                        </SheetDescription>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium mt-4">
                        <button onClick={() => handleNav('/')} className="flex items-center gap-4 px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg">
                            <Logo />
                        </button>
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
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6">
            <Logo />
            {navItems.map(item => (
                 <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleNav(item.href)}
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        pathname === item.href ? 'bg-green-600' : 'hover:bg-green-600/50'
                    )}
                    >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            ))}
        </div>
      
        <div className="flex items-center gap-2 ml-auto">
            <Button variant="secondary" onClick={() => setUploadOpen(true)} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Claim
            </Button>
        </div>
      </header>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={handleClaimAdded}/>
    </>
  );
}
