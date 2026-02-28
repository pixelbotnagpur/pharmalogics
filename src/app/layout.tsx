
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LayoutProvider } from '@/components/common/LayoutProvider';
import { CartProvider } from '@/hooks/use-cart';
import { MegaMenuProvider } from '@/hooks/use-mega-menu';
import { SmoothScroll } from '@/components/common/SmoothScroll';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeInjector } from '@/components/common/ThemeInjector';
import { SEOManager } from '@/components/common/SEOManager';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pharmlogics Healthcare',
  description: 'Your partner in natural wellness and health.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400&family=Syne:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen font-body antialiased bg-transparent')}>
        <FirebaseClientProvider>
          <SEOManager />
          <ThemeInjector />
          <CartProvider>
            <MegaMenuProvider>
              <SmoothScroll>
                <LayoutProvider>
                  {children}
                </LayoutProvider>
                <Toaster />
              </SmoothScroll>
            </MegaMenuProvider>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
