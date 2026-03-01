'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomMegaMenu } from '@/components/common/BottomMegaMenu';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { FixedFormulaFinder } from '@/components/common/FixedFormulaFinder';
import { cn } from '@/lib/utils';

// Dynamic imports for heavy interactive nodes to optimize initial TTI
const AIChatConcierge = dynamic(() => import('@/components/common/AIChatConcierge').then(mod => mod.AIChatConcierge), { ssr: false });
const NewsletterDialog = dynamic(() => import('@/components/common/NewsletterDialog').then(mod => mod.NewsletterDialog), { ssr: false });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  
  // Define routes that should NOT have the global header/footer (Focused Pages)
  const isStandalonePage = ['/login', '/signup', '/checkout', '/checkout/success'].includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');
  const isQuizPage = pathname === '/formula-finder';

  // For Admin pages, we return only children to allow the AdminLayout to manage the workspace entirely
  if (isAdminPage) {
    return (
      <div className="relative min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // For focused pages (Login/Signup/Checkout), we use a simplified container without global elements
  if (isStandalonePage) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col bg-background">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Standard public storefront layout
  return (
    <div className="relative min-h-screen">
      {/* Scrollable Site Layer */}
      <div className={cn(
        "relative z-10 flex min-h-dvh flex-col pb-[100vh] md:pb-[450px] bg-transparent pointer-events-none"
      )}>
        {/* We restore pointer-events-auto for all interactive children of the scrollable layer */}
        <div className="pointer-events-auto">
          <Header />
        </div>
        
        <main className="flex-1 pt-16 bg-background pointer-events-auto">
          {children}
        </main>
        
        <div className="pointer-events-auto flex flex-col">
          {!isQuizPage && <FixedFormulaFinder />}
          <NewsletterSection />
          <Footer />
        </div>
      </div>

      {/* Floating Global Elements - Loaded dynamically */}
      {!isAdminPage && !isStandalonePage && (
        <>
          <AIChatConcierge />
          <NewsletterDialog />
        </>
      )}

      {/* Fixed Floor Layer (Mega Menu) */}
      <BottomMegaMenu />
    </div>
  );
}
