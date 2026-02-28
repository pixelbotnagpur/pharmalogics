
"use client";

import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType, StoreSettings } from '@/lib/types';
import { X, Minus, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, toggleSubscription } = useCart();
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '';

  return (
    <div className="flex flex-col gap-0 rounded-xl bg-card border-none shadow-sm w-full mb-3 overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted/10 p-1">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            className="object-contain"
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between min-h-[80px] min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-headline text-lg font-normal text-foreground leading-tight truncate">
                  {item.name}
              </h3>
              {item.packLabel && (
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-light truncate">
                  Size: <span className="text-primary font-bold">{item.packLabel}</span>
                </p>
              )}
            </div>
            <button
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              onClick={() => removeItem(item.id, item.packLabel, item.subscriptionFrequency)}
              aria-label={`Remove ${item.name} from cart`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-30"
                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.packLabel, item.subscriptionFrequency)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-xs font-bold text-primary">{item.quantity}</span>
                <button
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-colors"
                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.packLabel, item.subscriptionFrequency)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="font-light text-sm text-foreground shrink-0">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {item.subscriptionFrequency ? (
        <div 
          className="bg-primary/5 border-t px-4 py-2.5 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => toggleSubscription(item.id, item.packLabel, item.subscriptionFrequency)}
        >
          <p className="text-[9px] font-bold text-primary uppercase tracking-[0.15em]">
            DELIVER EVERY {item.subscriptionFrequency} DAYS
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Switch to one-time</span>
            <ChevronDown className="h-3 w-3 text-primary group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>
      ) : (
        <button 
          onClick={() => toggleSubscription(item.id, item.packLabel)}
          className="bg-primary text-primary-foreground py-3 text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors w-full"
        >
          UPGRADE TO SUBSCRIBE & SAVE 15%
        </button>
      )}
    </div>
  );
}
