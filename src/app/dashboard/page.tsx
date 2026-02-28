'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Repeat, ArrowRight, Sparkles, Loader2, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import type { Order, Subscription, UserProfile, StoreSettings } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db, user]);

  const { data: recentOrders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);
  const recentOrder = recentOrders?.[0];

  const subQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'subscriptions');
  }, [db, user]);
  const { data: subscriptions, isLoading: subsLoading } = useCollection<Subscription>(subQuery);
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'Active').length || 0;

  const isLoading = profileLoading || ordersLoading || subsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Synchronizing Clinical Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border/30">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">OPTIMIZATION OVERVIEW</p>
          <h1 className="text-4xl md:text-5xl font-headline font-normal leading-tight">
            Greetings, {profile?.firstName || 'Clinical User'}.
          </h1>
        </div>
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/10">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Protocol Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider">Active & Optimized</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Order Card */}
        <Card className="border-none shadow-none bg-card group overflow-hidden rounded-2xl relative">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Latest Logistical Node</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest mt-1">
                {recentOrder ? `Tracking ID: ${recentOrder.id.slice(-8).toUpperCase()}` : 'Registry empty'}
              </CardDescription>
            </div>
            <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {recentOrder ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Batch Total</p>
                    <div className="text-3xl font-headline text-foreground">{currencySymbol}{recentOrder.total.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border",
                      recentOrder.status === 'Delivered' ? "bg-green-50 text-green-700 border-green-200" : 
                      recentOrder.status === 'Shipped' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    )}>
                      {recentOrder.status}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-dashed">
                  <Button variant="ghost" className="w-full justify-between h-12 px-4 hover:bg-primary hover:text-white transition-all rounded-md group/link" asChild>
                    <Link href={`/order-tracking?id=${recentOrder.id}`}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">View Clinical Lifecycle</span>
                      <ArrowRight className="h-4 w-4 transition-transform group/link:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground font-light text-sm italic">No clinical acquisitions detected in your registry.</p>
                <Button asChild variant="outline" size="sm" className="h-10 px-6 text-[10px] font-bold uppercase tracking-[0.2em] border-primary text-primary hover:bg-primary hover:text-white">
                  <Link href="/products">EXPLORE CATALOG</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions Card */}
        <Card className="border-none shadow-none bg-primary text-white overflow-hidden relative rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/60">Automated Routines</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Bio-Replenishment Registry</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Repeat className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Active Protocols</p>
                  <div className="text-3xl font-headline">{activeSubscriptions} Formulas</div>
                </div>
                {activeSubscriptions > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                    <ShieldCheck className="h-3 w-3 text-green-400" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Protocol Verified</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-white/10">
                <Button variant="ghost" className="w-full justify-between h-12 px-4 hover:bg-white hover:text-primary transition-all rounded-md text-white group/link" asChild>
                  <Link href="/dashboard/subscriptions">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Manage Replenishment Schedule</span>
                    <ArrowRight className="h-4 w-4 transition-transform group/link:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </Card>
      </div>

      {/* Discovery Tool Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white p-8 md:p-12 border border-border/10 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-accent">
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">BIOLOGICAL INSIGHT</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-headline font-normal leading-tight">Advanced Protocol <br /> Optimization.</h3>
            <p className="text-muted-foreground text-base font-light leading-relaxed">
              Based on your clinical profile and latest orders, our AI models recommend an <span className="text-primary font-medium">HPLC-verified antioxidant audit</span> to support your recovery phase.
            </p>
          </div>
          <Button asChild className="h-16 px-12 rounded-xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all shrink-0">
            <Link href="/formula-finder">RE-RUN BIOLOGICAL AUDIT</Link>
          </Button>
        </div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
