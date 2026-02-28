'use client';

import { Mail, Phone, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ContactRegistryProps {
  email: string;
  setEmail: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  isLoggedIn: boolean;
}

/**
 * @fileOverview ContactRegistry - Handles the primary user identity input for checkout.
 * Includes a prominent membership benefit prompt for unauthenticated users.
 */
export function ContactRegistry({ email, setEmail, phoneNumber, setPhoneNumber, isLoggedIn }: ContactRegistryProps) {
  const inputClasses = "h-11 border-black/50 bg-transparent rounded-md focus-visible:ring-1 focus-visible:ring-primary/20";

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-headline font-normal leading-none">Contact Registry</h2>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Membership Protocol Inactive</p>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Log in to synchronize your clinical dashboard, apply saved protocols, and unlock Tier One benefits.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-11 px-8 border-primary text-primary hover:bg-primary hover:text-white shrink-0 group">
            <Link href="/login?redirect=/checkout" className="flex items-center gap-2">
              LOG IN FOR BENEFITS <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Fulfillment Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              type="email" 
              placeholder="jane@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={cn(inputClasses, "pl-12")} 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Contact Mobile</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              className={cn(inputClasses, "pl-12")} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
