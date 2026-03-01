
'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product, StoreSettings } from '@/lib/types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  const marqueeText = product.benefits.join(' / ');
  const detailRoute = product.category === 'Bundles' ? `/bundles/${product.id}` : `/products/${product.id}`;

  return (
    <div className="group flex flex-col space-y-4">
      {/* Visual Node - Square Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/5 border-0">
        <Link href={detailRoute} className="absolute inset-0 z-20">
          <span className="sr-only">View {product.name}</span>
        </Link>

        {/* Background Image */}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-clinical group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          data-ai-hint={product.imageHint}
        />
        
        <Badge variant="accent" className="absolute top-4 left-4 z-20 shadow-lg border-none">
          {product.category}
        </Badge>

        {/* Hover Overlay - Preserved Logic */}
        <div className="absolute bottom-0 left-0 w-full h-[45%] bg-gradient-to-t from-black/90 to-transparent text-white p-5 flex flex-col justify-end z-10
                        transition-all duration-500 ease-clinical [clip-path:polygon(0_100%,100%_100%,100%_100%,0_100%)]
                        group-hover:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Protocol Insight</p>
          <p className="text-sm font-light leading-snug line-clamp-2 mb-4">
            {product.description}
          </p>
          
          <div className="relative flex overflow-hidden [--gap:1rem] opacity-80">
            <div className="flex min-w-full flex-shrink-0 animate-[marquee-left_20s_linear_infinite] items-center gap-[--gap]">
              <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em]">{marqueeText}</p>
            </div>
            <div className="flex min-w-full flex-shrink-0 animate-[marquee-left_20s_linear_infinite] items-center gap-[--gap]" aria-hidden="true">
              <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em]">{marqueeText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Node - External Block */}
      <div className="flex justify-between items-start gap-4 px-1">
        <div className="min-w-0">
          <h3 className="font-headline text-xl font-normal text-foreground leading-tight truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1.5 font-bold">
            {product.benefits[0]}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="font-headline text-xl text-primary">
            {currencySymbol}{product.price.toFixed(2)}
          </p>
          <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground opacity-40 mt-1">INC. TAX</span>
        </div>
      </div>
    </div>
  );
}
