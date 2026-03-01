'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function FeaturedProductsSection() {
  const db = useFirestore();
  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  const featuredProducts = products?.filter(p => p.category !== 'Bundles').slice(0, 4) || [];

  return (
    <section className="pt-12 md:pt-24 pb-0 bg-background border-t border-border/10">
      <div className="container mx-auto px-4">
        <SectionHeader 
          index="01"
          title="CURATED SOLUTIONS"
          description="High-Bioavailability formulas designed for specific health outcomes."
          ctaLabel="SHOP FULL CATALOG"
          ctaHref="/products"
          refId="REG.CATALOG.INFRA"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
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
