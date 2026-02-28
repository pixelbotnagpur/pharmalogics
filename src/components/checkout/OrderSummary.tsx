
'use client';

import Image from 'next/image';
import { ShoppingCart, Tag, XCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CartItem, StoreSettings } from '@/lib/types';

interface OrderSummaryProps {
  cart: CartItem[];
  totalPrice: number;
  settings?: StoreSettings | null;
  isSettingsLoading?: boolean;
  appliedDiscount: number;
  activeCoupon: string | null;
  tax: number;
  shipping: number;
  isFreeShipping: boolean;
  total: number;
  couponInput: string;
  setCouponInput: (val: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onAuthorize: () => void;
  isSubmitting: boolean;
}

export function OrderSummary({
  cart,
  totalPrice,
  settings,
  isSettingsLoading,
  appliedDiscount,
  activeCoupon,
  tax,
  shipping,
  isFreeShipping,
  total,
  couponInput,
  setCouponInput,
  onApplyCoupon,
  onRemoveCoupon,
  onAuthorize,
  isSubmitting
}: OrderSummaryProps) {
  // Use empty string as fallback to prevent symbol flash (e.g. $ appearing before ₹)
  const currencySymbol = settings?.currencySymbol || '';
  const currencyCode = settings?.currencyCode || '';

  return (
    <Card className="border-none shadow-none rounded-xl bg-card overflow-hidden">
      <CardHeader className="bg-primary text-white p-6">
        <CardTitle className="text-lg font-headline">Order Protocol Summary</CardTitle>
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/60 mt-2">Laboratory Acquisition Registry</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] px-6 py-4">
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 p-2 border border-black/20 rounded-md">
                <div className="relative h-16 w-16 rounded-md border border-black/10 bg-background overflow-hidden flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1.5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs font-bold truncate">{item.name}+</h4>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{item.subscriptionFrequency ? `Every ${item.subscriptionFrequency} Days` : 'One-time delivery'}</p>
                </div>
                <div className="text-xs font-medium flex items-center px-2">
                  {isSettingsLoading ? (
                    <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  ) : (
                    `${currencySymbol}${(item.price * item.quantity).toFixed(2)}`
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="px-6 pb-6 space-y-6">
          <div className="pt-4 border-t border-dashed">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 block">Clinical Access Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <Input 
                  placeholder="ENTER PROTOCOL" 
                  value={couponInput} 
                  onChange={(e) => setCouponInput(e.target.value)} 
                  className="h-10 pl-10 border-black/50 bg-muted/20 rounded-md font-mono text-xs uppercase" 
                  disabled={!!activeCoupon} 
                />
              </div>
              {activeCoupon ? (
                <Button variant="ghost" size="icon" onClick={onRemoveCoupon}><XCircle className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={onApplyCoupon} variant="outline" className="h-10 px-4 uppercase text-[9px] font-bold tracking-widest border-primary text-primary hover:bg-primary hover:text-white">Apply</Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-light uppercase tracking-widest">Clinical Subtotal</span>
              <span className="font-medium">
                {isSettingsLoading ? <div className="h-3 w-16 bg-muted animate-pulse rounded inline-block" /> : `${currencySymbol}${totalPrice.toFixed(2)}`}
              </span>
            </div>
            
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span className="font-bold uppercase tracking-widest">Protocol Discount</span>
                <span className="font-bold">-{currencySymbol}{appliedDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-light uppercase tracking-widest">Clinical Tax</span>
              <span className="font-medium">
                {isSettingsLoading ? <div className="h-3 w-12 bg-muted animate-pulse rounded inline-block" /> : `${currencySymbol}${tax.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-light uppercase tracking-widest">Logistics</span>
              <span className={cn("font-bold", isFreeShipping ? "text-primary" : "")}>
                {isFreeShipping ? 'COMPLIMENTARY' : (isSettingsLoading ? <div className="h-3 w-10 bg-muted animate-pulse rounded inline-block" /> : `${currencySymbol}${shipping.toFixed(2)}`)}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t">
              <span className="text-xl font-headline font-normal">Total.</span>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground mr-2">{currencyCode}</span>
                <span className="text-3xl font-headline text-primary">
                  {isSettingsLoading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded inline-block translate-y-1" />
                  ) : (
                    `${currencySymbol}${total.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full h-14 text-xs font-bold tracking-[0.2em] rounded-md shadow-2xl" variant="accent" disabled={isSubmitting || isSettingsLoading} onClick={onAuthorize}>
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AUTHORIZE ACQUISITION'}
          </Button>
          
          <div className="flex items-start gap-2.5 p-3 bg-muted/20 rounded-md border border-border/10">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-[9px] text-muted-foreground uppercase leading-relaxed font-medium tracking-wide">All acquisition protocols are subject to quality control verification at our Miami facility.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
