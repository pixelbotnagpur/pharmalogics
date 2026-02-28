'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, Repeat } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Subscription, StoreSettings } from '@/lib/types';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  const subQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'subscriptions');
  }, [db, user]);

  const { data: subscriptions, isLoading } = useCollection<Subscription>(subQuery);

  return (
    <div className="space-y-10">
      <div className="pb-10 border-b border-border/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">RECURRING LOGISTICS</p>
        <h1 className="text-4xl md:text-5xl font-headline font-normal leading-tight">Subscriptions.</h1>
        <p className="text-sm text-muted-foreground font-light mt-4 max-w-md leading-relaxed">
          Manage your automated replenishment protocols and clinical delivery frequencies.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-muted-foreground">Synchronizing Automated Deliveries...</p>
        </div>
      ) : subscriptions && subscriptions.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="border-none shadow-none bg-card rounded-xl overflow-hidden group">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 flex-shrink-0 bg-muted/20 rounded-md overflow-hidden">
                    <Image src={sub.imageUrl} alt={sub.productName} fill className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium truncate max-w-[120px]">{sub.productName}</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest">Every {sub.frequency} days</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-md">
                    <DropdownMenuItem className="text-xs uppercase font-bold tracking-widest">Pause Subscription</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs uppercase font-bold tracking-widest">Change Frequency</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs uppercase font-bold tracking-widest">Update Payment</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive text-xs uppercase font-bold tracking-widest">Cancel Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge 
                    variant={sub.status === 'Active' ? 'default' : 'secondary'}
                    className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5"
                  >
                    {sub.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xl font-headline">{currencySymbol}{sub.price.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Next: {sub.nextBillingDate || 'TBD'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-muted/10 rounded-2xl border border-dashed border-border/40">
          <div className="max-w-xs mx-auto space-y-6">
            <Repeat className="h-16 w-16 mx-auto text-muted-foreground/20" strokeWidth={1} />
            <div className="space-y-2">
              <h3 className="text-xl font-headline">Zero Recurring Protocols</h3>
              <p className="text-sm text-muted-foreground font-light">Establish an automated replenishment cycle to save 15% on every delivery.</p>
            </div>
            <Button asChild variant="primary" className="h-12 px-10 uppercase text-[10px] font-bold tracking-widest">
              <Link href="/products">VIEW FORMULAS</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
