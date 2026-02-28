'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';

export default function OrderSuccessPage() {
  const db = useFirestore();
  const [orderId, setOrderId] = useState('');

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading: isSettingsLoading } = useDoc<StoreSettings>(settingsRef);

  useEffect(() => {
    setOrderId(`ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  }, []);

  return (
    <div className="container mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-16">
      {/* Decoupled Header - Full Container Width with Navigation Hidden */}
      <CheckoutHeader settings={settings} isLoading={isSettingsLoading} hideNavigation={true} />

      {/* Body Content - Constrained Width */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 py-12 border-b border-dashed">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-8"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-headline font-normal mb-4">Pure Excellence.</h1>
          <p className="text-xl text-muted-foreground font-light">Your order has been confirmed. Your journey to peak wellness starts here.</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-none shadow-none bg-card rounded-xl overflow-hidden">
            <CardHeader className="border-b pb-4 bg-muted/30">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                <Package className="h-4 w-4" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order ID</span>
                <span className="font-headline text-xl text-primary">{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Logistical Lead Time</span>
                <span className="text-sm font-medium">3 - 5 Business Days</span>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-xl flex items-start gap-4 border border-accent/10">
                <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Clinical Confirmation Sent</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    We've sent a high-integrity receipt and real-time tracking link to your registered email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-primary text-white rounded-xl overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-headline font-normal">Track Your Progress</h3>
                <p className="text-sm text-white/70 font-light max-w-sm">Manage your formulas and view clinical status updates in your dashboard.</p>
              </div>
              <Button asChild variant="outline" className="shrink-0 bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary h-12 rounded-md">
                <Link href="/dashboard" className="flex items-center gap-2">VIEW DASHBOARD <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild variant="ghost" className="h-12 px-8 uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary">
              <Link href="/products">CONTINUE SHOPPING</Link>
            </Button>
            <Button asChild variant="ghost" className="h-12 px-8 uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary">
              <Link href="/faqs">DELIVERY GUIDELINES</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
