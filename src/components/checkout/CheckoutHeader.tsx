'use client';

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import type { StoreSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CheckoutHeaderProps {
  settings?: StoreSettings | null;
  isLoading?: boolean;
  hideNavigation?: boolean;
}

export function CheckoutHeader({ settings, isLoading, hideNavigation = false }: CheckoutHeaderProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <Link href="/" className="flex items-center gap-2">
          {isLoading || !settings ? (
            <Skeleton className="h-8 w-32 bg-muted/20" />
          ) : (
            settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.storeName} 
                className="h-8 w-auto transition-opacity duration-500" 
              />
            ) : (
              <span className="font-headline text-2xl font-normal text-primary">
                {settings.storeName}
              </span>
            )
          )}
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] hidden sm:inline">Encrypted Checkout Session</span>
        </div>
      </div>

      {!hideNavigation && (
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <Link href="/products" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Continue Acquisition
          </Link>
        </div>
      )}
    </div>
  );
}
