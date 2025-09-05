
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { LayoutGrid, List, Map, Lightbulb, TrendingUp, LandPlot, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation'; // Using next/navigation for app router
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
  { id: 'village-analysis', label: 'Village Analysis', icon: Lightbulb, href: '/analysis' },
  { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp, href: '/predictive' },
  { id: 'community-assets', label: 'Community Assets', icon: LandPlot, href: '/assets' },
];

type SidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
}


export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleNav = (href: string) => {
    router.push(href);
    if(isMobile) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  }

  const sidebarClasses = cn(
    "bg-card text-card-foreground border-r flex flex-col transition-all duration-300 ease-in-out",
    {
        'w-64 p-4': !isMobile, // Desktop
        'fixed inset-y-0 left-0 z-50 w-64 p-4': isMobile, // Mobile
        'translate-x-0': isMobile && isOpen,
        '-translate-x-full': isMobile && !isOpen,
    }
  )

  return (
    <>
    {isMobile && isOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-40" 
            onClick={onToggle}
        />
    )}
    <aside className={sidebarClasses}>
        <div className="flex items-center justify-between pb-4 border-b mb-4">
            <Logo />
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={onToggle}>
                    <X className="h-4 w-4"/>
                </Button>
            )}
        </div>

        <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
                <Button
                key={item.id}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => handleNav(item.href)}
                >
                <item.icon className="h-4 w-4" />
                {item.label}
                </Button>
            ))}
        </nav>
    </aside>
    </>
  );
}
