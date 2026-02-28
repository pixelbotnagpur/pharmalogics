'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ProductCard } from '@/components/product/ProductCard';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function FeaturedProductsSection() {
  const db = useFirestore();
  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  // Show the first 4 products from the live database
  const featuredProducts = products?.filter(p => p.category !== 'Bundles').slice(0, 4) || [];

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Featured Products</p>
            <h2 className="text-3xl md:text-4xl font-headline font-normal mt-2">Shop by solution</h2>
          </div>
          <div className="md:text-right max-w-lg">
              <p className="text-lg text-muted-foreground font-light">
                Explore our curated solutions for your specific health goals.
              </p>
               <ModernAnimatedButton href="/products" className="mt-4">
                  Shop All
               </ModernAnimatedButton>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-h-[400px]">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground font-light italic">The clinical catalog is currently being synchronized...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
