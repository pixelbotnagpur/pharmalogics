
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
  const currencySymbol = settings?.currencySymbol || '';

  const marqueeText = product.benefits.join(' / ');
  const detailRoute = product.category === 'Bundles' ? `/bundles/${product.id}` : `/products/${product.id}`;

  return (
    <Card className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card text-card-foreground border-0">
      <Link href={detailRoute} className="absolute inset-0 z-10">
        <span className="sr-only">View {product.name}</span>
      </Link>

      {/* Background Image */}
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        data-ai-hint={product.imageHint}
      />
      <Badge variant="accent" className="absolute top-4 left-4 z-20">
        {product.category}
      </Badge>
     
      {/* Initial Text */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0 text-white">
          <div className="flex justify-between items-end">
              <div>
                  <h3 className="font-headline text-xl leading-tight">{product.name}</h3>
                  <p className="text-sm uppercase tracking-wider text-white/80">{product.benefits[0]}</p>
              </div>
              <p className="text-lg font-light">{currencySymbol}{product.price.toFixed(2)}</p>
          </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/80 to-transparent text-white p-4 flex flex-col justify-end
                      transition-all duration-500 ease-clinical [clip-path:polygon(0_100%,100%_100%,100%_100%,0_100%)]
                      group-hover:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]">
        <h3 className="font-headline text-xl leading-tight">{product.name}</h3>
        <p className="text-sm uppercase tracking-wider text-white/80 my-1">{product.description.split('.')[0]}</p>
        
        <div className="relative mt-2 flex overflow-hidden [--gap:1rem]">
          <div className="flex min-w-full flex-shrink-0 animate-[marquee-left_20s_linear_infinite] items-center gap-[--gap]">
            <p className="whitespace-nowrap text-xs uppercase tracking-widest">{marqueeText}</p>
          </div>
          <div className="flex min-w-full flex-shrink-0 animate-[marquee-left_20s_linear_infinite] items-center gap-[--gap]" aria-hidden="true">
            <p className="whitespace-nowrap text-xs uppercase tracking-widest">{marqueeText}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
