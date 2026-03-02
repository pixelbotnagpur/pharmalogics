'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

export function NewsletterSection() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  
  const storeName = settings?.storeName || 'Pharmlogics';

  return (
    <section className="py-12 md:py-24 bg-primary/90 backdrop-blur-sm text-primary-foreground">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h2 className="text-4xl md:text-5xl font-headline font-normal">Inside {storeName}</h2>
        <p className="mt-4 text-primary-foreground/80">
          Sign up for 10% off your first purchase and early access to launches, news, and offers.
        </p>
        <form className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input id="first-name" placeholder="First Name" className="h-12 bg-white/5 border-white/20 placeholder:text-white/60 flex-1" />
            <Input id="last-name" placeholder="Last Name" className="h-12 bg-white/5 border-white/20 placeholder:text-white/60 flex-1" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input id="email" type="email" placeholder="Email" className="h-12 bg-white/5 border-white/20 placeholder:text-white/60 flex-1" />
            <Button type="submit" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 px-6">SIGN UP</Button>
          </div>
          <div className="flex items-center space-x-2 justify-center pt-2">
            <Checkbox id="terms" className="border-primary-foreground/60 data-[state=checked]:bg-accent data-[state=checked]:border-transparent" />
            <Label htmlFor="terms" className="text-sm font-light text-primary-foreground/80">
              {storeName} can contact me via email about promotions and content.
            </Label>
          </div>
        </form>
      </div>
    </section>
  );
}
