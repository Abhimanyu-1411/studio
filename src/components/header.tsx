'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { LayoutGrid, Upload, List, Map, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

type HeaderProps = {
  onNavClick: (view: string) => void;
  onUploadClick: () => void;
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'claims-list', label: 'Claims List', icon: List },
  { id: 'villages', label: 'Villages', icon: Map },
];

export function Header({ onNavClick, onUploadClick }: HeaderProps) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    setActiveItem(view);
    onNavClick(view);
    setMobileMenuOpen(false);
  }
  
  const handleUpload = () => {
    onUploadClick();
    setMobileMenuOpen(false);
  }

  const navLinks = (
     <>
        {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? 'secondary' : 'ghost'}
              className="justify-start gap-2"
              onClick={() => handleNav(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={handleUpload}
          >
            <Upload className="h-4 w-4" />
            Upload Claims
          </Button>
    </>
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Logo />
      </div>

      <nav className="hidden md:flex items-center gap-2 text-sm font-medium ml-6">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeItem === item.id ? 'default' : 'ghost'}
            onClick={() => handleNav(item.id)}
            className={`transition-colors h-9 px-4 ${activeItem === item.id ? 'bg-primary text-primary-foreground' : ''}`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <Button onClick={handleUpload} className="hidden sm:flex">
          <Upload className="mr-2 h-4 w-4" />
          Upload Claim
        </Button>
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="p-4">
              <Logo />
            </div>
            <nav className="grid gap-2 text-lg font-medium p-4">
              {navLinks}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
