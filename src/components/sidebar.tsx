
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { LayoutGrid, List, Map, Lightbulb, TrendingUp, LandPlot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/' },
  { id: 'claims-list', label: 'Claims List', icon: List, href: '/claims' },
  { id: 'villages', label: 'Villages', icon: Map, href: '/villages' },
  { id: 'village-analysis', label: 'Village Analysis', icon: Lightbulb, href: '/analysis' },
  { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp, href: '/predictive' },
  { id: 'community-assets', label: 'Community Assets', icon: LandPlot, href: '/assets' },
];


export function Sidebar() {
  const pathname = usePathname();

  // The sidebar is now only for icon tooltips on desktop, main nav is in Header.
  // This could be removed if we don't want the icon-only sidebar anymore.
  // For now, let's keep it but hide it, as the Header component handles all navigation.
  return null;
  
  /*
  return (
     <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col border-r bg-background sm:flex">
        <Link href="/" className="flex h-14 items-center justify-center">
            <Logo />
            <span className="sr-only">FRA Atlas</span>
        </Link>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
            {navItems.map(item => (
                <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                         <Link
                            href={item.href}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                pathname === item.href && "bg-accent text-accent-foreground"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
  */
}
