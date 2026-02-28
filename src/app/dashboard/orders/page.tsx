'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2, Package } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Order, StoreSettings } from '@/lib/types';

export default function OrdersPage() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <div className="space-y-10">
      <div className="pb-10 border-b border-border/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">LOGISTICS HISTORY</p>
        <h1 className="font-headline text-4xl md:text-5xl font-normal leading-tight text-foreground">Your Orders.</h1>
        <p className="text-sm text-muted-foreground font-light mt-4 max-w-md leading-relaxed">
          A comprehensive registry of your clinical-grade formula acquisitions and their current delivery status from our Miami facility.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-muted-foreground">Retrieving Logistics History...</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-foreground pl-6">Order ID</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-foreground">Date</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-foreground">Status</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-foreground text-right">Total</TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-foreground text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border/20 hover:bg-muted/5 transition-colors">
                  <TableCell className="font-light pl-6 py-6 text-sm truncate max-w-[150px]">{order.id}</TableCell>
                  <TableCell className="font-light text-sm">
                    {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                      className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-headline text-lg pr-4">
                    {currencySymbol}{order.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="rounded-md h-9 px-4 uppercase text-[10px] font-bold tracking-widest border-foreground/20 hover:border-primary hover:bg-primary hover:text-white transition-all group"
                      >
                        <Link href={`/order-tracking?id=${order.id}`}>
                          Track <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-24 text-center space-y-6">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20" strokeWidth={1} />
            <div className="space-y-2">
              <h3 className="text-xl font-headline">No Clinical Records Found</h3>
              <p className="text-sm text-muted-foreground font-light">Your order history will appear here once you've completed a purchase.</p>
            </div>
            <Button asChild variant="primary" className="h-12 px-10 uppercase text-[10px] font-bold tracking-widest">
              <Link href="/products">EXPLORE FORMULAS</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
