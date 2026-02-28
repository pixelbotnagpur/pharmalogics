'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

interface StickyBarProps {
  isVisible: boolean;
  productName: string;
  packLabel?: string;
  quantity: number;
  setQuantity: (val: number | ((prev: number) => number)) => void;
  onAddToCart: () => void;
  totalPrice: number;
}

export function StickyPurchaseBar({
  isVisible,
  productName,
  packLabel,
  quantity,
  setQuantity,
  onAddToCart,
  totalPrice
}: StickyBarProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t"
        >
          <div className="w-full px-4 py-3 md:px-6">
            <div className="flex items-center justify-between gap-3 w-full max-w-screen-xl mx-auto">
              <div className='hidden lg:block shrink-0'>
                <h4 className='font-light truncate max-w-[200px]'>
                  {productName}+ <span className='text-[10px] text-muted-foreground ml-2 uppercase tracking-widest'>{packLabel}</span>
                </h4>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-between sm:justify-end min-w-0">
                <div className="flex items-center border rounded-md bg-card h-11 shrink-0">
                  <button
                    className="w-10 h-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(q => Math.max(1, typeof q === 'number' ? q - 1 : 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-light h-full flex items-center justify-center text-sm border-x">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-full flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={() => setQuantity(q => (typeof q === 'number' ? q + 1 : 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1 max-w-[280px] h-11 px-4 text-[10px] font-bold tracking-widest truncate min-w-0" 
                  onClick={onAddToCart}
                >
                  ADD — {currencySymbol}{totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile safe area spacer */}
          <div className="h-[env(safe-area-inset-bottom)] md:hidden bg-background/95" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
