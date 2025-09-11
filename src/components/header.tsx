
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Menu, LayoutGrid, List, MapPin as Map, Lightbulb, TrendingUp, LandPlot } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from './icons';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
  { id: 'village-analysis', label: 'Village Analysis', icon: Lightbulb, href: '/analysis' },
  { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp, href: '/predictive' },
  { id: 'community-assets', label: 'Community Assets', icon: LandPlot, href: '/assets' },
];

export function Header({ onUploadClick }: { onUploadClick: () => void }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const handleSheetNav = () => {
    setSheetOpen(false);
  };
  
  return (
    <>
      <header className="sticky top-0 z-30 flex h-24 items-center gap-4 border-b bg-primary px-4 text-primary-foreground sm:px-6">
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
                        <Link href="/" onClick={handleSheetNav} className="flex items-center gap-4 px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg">
                            <Logo />
                        </Link>
                        {navItems.map(item => (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={handleSheetNav}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg",
                                    pathname === item.href && "bg-accent text-accent-foreground"
                                )}
                                >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6">
            <Logo />
            {navItems.map(item => (
                 <Button key={item.id} asChild variant="ghost"
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        pathname === item.href ? 'bg-green-600' : 'hover:bg-green-600/50'
                    )}
                 >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                </Button>
            ))}
        </div>
      
        <div className="flex items-center gap-2 ml-auto">
            <Button variant="secondary" onClick={onUploadClick} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Claim
            </Button>
        </div>
      </header>
    </>
  );
}
