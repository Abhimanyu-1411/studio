
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/app-layout';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FRA Atlas',
  description: 'Forest Rights Act Decision Support System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppLayout>
              {children}
            </AppLayout>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
