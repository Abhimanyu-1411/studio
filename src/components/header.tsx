
'use client';

import { Button } from '@/components/ui/button';
import { Upload, Menu, LayoutGrid, List, MapPin as Map } from 'lucide-react';
import { ClaimUpload } from './claim-upload';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './icons';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
];

export function Header() {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
  };
  
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-primary px-4 text-primary-foreground sm:px-6">
        {/* Mobile Nav */}
        <div className="sm:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="text-primary-foreground bg-primary hover:bg-primary/90">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
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
            <Button variant="secondary" onClick={() => setUploadOpen(true)} className="flex">
            <Upload className="mr-2 h-4 w-4" />
            Upload Claim
            </Button>
        </div>
      </header>
      <ClaimUpload open={isUploadOpen} onOpenChange={setUploadOpen} onClaimAdded={() => {
          router.refresh();
      }}/>
    </>
  );
}
