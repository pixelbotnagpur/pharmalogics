'use client';

import { Truck, ShieldCheck, Clock, XCircle } from 'lucide-react';

export function PurchaseBadges() {
  return (
    <div className="border-t pt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <Truck className="h-6 w-6 mx-auto text-accent" strokeWidth={1} />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Free Delivery</p>
        </div>
        <div>
          <ShieldCheck className="h-6 w-6 mx-auto text-accent" strokeWidth={1} />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Secure Payment</p>
        </div>
        <div>
          <Clock className="h-6 w-6 mx-auto text-accent" strokeWidth={1} />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">48 Hrs Shipment</p>
        </div>
        <div>
          <XCircle className="h-6 w-6 mx-auto text-accent" strokeWidth={1} />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Non Returnable</p>
        </div>
      </div>
    </div>
  );
}
