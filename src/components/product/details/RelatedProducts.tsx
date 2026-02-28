
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Product, StoreSettings } from '@/lib/types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  return (
    <div>
      <h3 className="font-light text-sm uppercase tracking-wider text-muted-foreground">Have you thought of these?</h3>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {products.map(related => (
          <Link href={`/products/${related.id}`} key={related.id}>
            <Card className="group flex items-center p-2 hover:bg-muted transition-colors border-0 bg-background shadow-none">
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image src={related.imageUrl} alt={related.name} fill className="object-contain" sizes="64px" data-ai-hint={related.imageHint} />
              </div>
              <CardContent className="p-2 flex-1">
                <h4 className="font-light">{related.name}+</h4>
                <p className="text-xs uppercase text-muted-foreground">{related.benefits[0]}</p>
                <p className="font-light mt-1">{currencySymbol}{related.price.toFixed(2)}</p>
              </CardContent>
              <div className={cn(
                "ml-auto flex-shrink-0 rounded-md h-8 w-8 flex items-center justify-center bg-accent text-accent-foreground transition-colors duration-300",
                "group-hover:bg-accent/90"
              )}>
                <span className="relative inline-block overflow-hidden h-4 w-4">
                  <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-full group-hover:translate-x-full" />
                  <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 translate-y-full -translate-x-full transition-transform duration-500 ease-out group-hover:translate-y-0 group-hover:translate-x-0" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
