
'use client';

import { Logo } from '@/components/icons';
import { LayoutGrid, List, Map, Lightbulb, TrendingUp, LandPlot } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';


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
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
  }

  return (
     <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Leaf className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">FRA Atlas</span>
        </a>
        <TooltipProvider>
            {navItems.map(item => (
                <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                         <button
                            onClick={() => handleNav(item.href)}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                pathname === item.href && "bg-accent text-accent-foreground"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}

function Leaf(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z"/>
            <path d="M12 2a7 7 0 0 1 7 7h2a10 10 0 0 0-19 6.22"/>
        </svg>
    )
}
