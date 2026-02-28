
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMegaMenu } from '@/hooks/use-mega-menu';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

export function DesktopNav({ useDarkText }: { useDarkText?: boolean }) {
  const { handleMegaMenuEnter, handleMegaMenuLeave } = useMegaMenu();
  const { isCartOpen } = useCart();

  // If cart is open, we disable hover triggers to prevent accidental overlapping panels
  const onMouseEnter = () => {
    if (!isCartOpen) {
      handleMegaMenuEnter();
    }
  };

  const textClass = useDarkText 
    ? "text-primary hover:text-primary hover:bg-primary/5" 
    : "text-white hover:text-white hover:bg-white/10";

  return (
    <nav className={cn(
      "absolute left-1/2 top-1/2 hidden h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md px-1 transition-all duration-300 md:flex",
      useDarkText ? "text-primary" : "text-white"
    )}>
        <div onMouseEnter={onMouseEnter} onMouseLeave={handleMegaMenuLeave}>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-3 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-colors",
              textClass
            )}
          >
            <Link href="/products">Shop</Link>
          </Button>
        </div>
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className={cn(
            "rounded-md px-3 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-colors",
            textClass
          )}
        >
          <Link href="/about">About</Link>
        </Button>
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className={cn(
            "rounded-md px-3 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-colors",
            textClass
          )}
        >
          <Link href="/faqs">FAQs</Link>
        </Button>
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className={cn(
            "rounded-md px-3 text-sm font-bold uppercase tracking-widest h-auto py-2 transition-colors",
            textClass
          )}
        >
          <Link href="/blog">Insights</Link>
        </Button>
    </nav>
  );
}
