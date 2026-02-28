"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CartItem } from './CartItem';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

export function CartSheet() {
  const { cart, itemCount, totalPrice, isFreeShipping, isCartOpen, setIsCartOpen } = useCart();
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  
  const currencySymbol = settings?.currencySymbol || '';
  const threshold = settings?.freeShippingThreshold || 50;
  
  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "z-40 bg-background border-none shadow-2xl overflow-hidden flex flex-col h-[70vh] md:h-[80vh]",
            "fixed top-16 right-0 left-0 md:left-auto md:right-4 w-full md:w-[400px] rounded-b-xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {itemCount > 0 ? (
            <div className="flex flex-col h-full" data-lenis-prevent>
              <div className="px-6 pt-8 pb-6 bg-white border-b text-center space-y-4 shrink-0">
                <div className="flex justify-center">
                  <div className="w-[80%]">
                    <Progress value={Math.min((totalPrice / threshold) * 100, 100)} className="h-1 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600" />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                  {isFreeShipping 
                    ? "YOU QUALIFY FOR FREE DELIVERY" 
                    : `YOU ARE ${currencySymbol}${(threshold - totalPrice).toFixed(2)} AWAY FROM FREE DELIVERY`
                  }
                </p>
              </div>

              <ScrollArea className="flex-1 bg-background w-full min-h-0">
                <div className="p-4 flex flex-col gap-3">
                  {cart.map((item, idx) => (
                    <CartItem key={`${item.id}-${idx}`} item={item} />
                  ))}
                </div>
              </ScrollArea>

              <div className="p-6 bg-white border-t border-border shrink-0">
                <div className="w-full space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="font-headline text-2xl font-normal text-foreground">Subtotal</span>
                    <span className="font-headline text-2xl font-normal text-foreground">
                      {currencySymbol}{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button asChild className="w-full h-12 text-base font-bold tracking-widest bg-primary text-white hover:bg-primary/90" variant="default" size="lg">
                    <Link href="/checkout" onClick={() => setIsCartOpen(false)}>GO TO CHECKOUT</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-12 bg-white">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-xl text-foreground">Your bag is empty</h3>
                <p className="text-muted-foreground text-sm font-light">Explore our formulas to fuel your journey.</p>
              </div>
              <Button asChild className="h-12 px-8 text-xs font-bold tracking-[0.15em] w-full bg-primary text-white hover:bg-primary/90" variant="default">
                <Link href="/products" onClick={() => setIsCartOpen(false)}>SHOP ALL PRODUCTS</Link>
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
