'use client';

import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

interface AddToCartProps {
  quantity: number;
  setQuantity: (val: number | ((prev: number) => number)) => void;
  onAddToCart: () => void;
  totalPrice: number;
}

export function AddToCart({ quantity, setQuantity, onAddToCart, totalPrice }: AddToCartProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  return (
    <div className="mt-2 flex items-center gap-3 w-full overflow-hidden">
      <div className="flex items-center border rounded-md h-12 bg-card shrink-0">
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
        className="flex-1 h-12 text-xs font-bold tracking-widest truncate min-w-0" 
        onClick={onAddToCart}
      >
        ADD TO BAG — {currencySymbol}{totalPrice.toFixed(2)}
      </Button>
    </div>
  );
}
