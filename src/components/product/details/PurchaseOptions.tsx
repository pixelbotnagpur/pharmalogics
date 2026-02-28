
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

interface PurchaseOptionsProps {
  purchaseType: 'onetime' | 'subscribe';
  onPurchaseTypeChange: (val: 'onetime' | 'subscribe') => void;
  frequency: string;
  onFrequencyChange: (val: string) => void;
  packBasePrice: number;
  subscriptionPrice: number;
  selectedPackLabel?: string;
  discountPercentage?: number;
}

export function PurchaseOptions({
  purchaseType,
  onPurchaseTypeChange,
  frequency,
  onFrequencyChange,
  packBasePrice,
  subscriptionPrice,
  selectedPackLabel,
  discountPercentage = 30
}: PurchaseOptionsProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  return (
    <RadioGroup value={purchaseType} onValueChange={(val) => onPurchaseTypeChange(val as any)} className="space-y-2">
      <Label htmlFor="onetime" className={cn(
        "flex flex-col p-4 gap-3 border-2 rounded-lg cursor-pointer transition-all",
        purchaseType === 'onetime' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}>
        <div className="flex items-center justify-between">
          <div className='flex items-center gap-3'>
            <RadioGroupItem value="onetime" id="onetime" />
            <span className='font-light uppercase tracking-widest'>One-time purchase</span>
          </div>
          <span className="font-light">{currencySymbol}{packBasePrice.toFixed(2)}</span>
        </div>
        <div className='pl-8 text-muted-foreground text-xs space-y-1'>
          <p className="font-bold text-primary uppercase">{selectedPackLabel || 'SINGLE'}</p>
          <p>USE CODE FIRST20 FOR 20% OFF YOUR FIRST ORDER.</p>
        </div>
      </Label>

      <Label htmlFor="subscribe" className={cn(
        "flex flex-col p-4 gap-3 border-2 rounded-lg cursor-pointer transition-all",
        purchaseType === 'subscribe' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}>
        <div className="flex items-center justify-between">
          <div className='flex items-center gap-3'>
            <RadioGroupItem value="subscribe" id="subscribe" />
            <span className='font-light uppercase tracking-widest'>Subscribe & Save {discountPercentage}%</span>
          </div>
          <div className='flex items-baseline gap-2'>
            <span className="font-light">{currencySymbol}{subscriptionPrice.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground line-through">{currencySymbol}{packBasePrice.toFixed(2)}</span>
          </div>
        </div>
        <div className='pl-8 text-muted-foreground text-xs space-y-1'>
          <p className="font-bold text-primary uppercase">{selectedPackLabel || 'SINGLE'}</p>
          <p>{discountPercentage}% OFF EVERY ORDER PLUS FREE SHIPPING</p>
          <p>NO COMMITMENT. CANCEL ANYTIME.</p>
          <Select value={frequency} onValueChange={onFrequencyChange} disabled={purchaseType !== 'subscribe'}>
            <SelectTrigger className="w-auto h-auto p-1 text-xs mt-2">
              <SelectValue placeholder="Delivery frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Deliver every 30 days</SelectItem>
              <SelectItem value="60">Deliver every 60 days</SelectItem>
              <SelectItem value="90">Deliver every 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Label>    </RadioGroup>
  );
}
