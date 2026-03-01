'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PromoVideo } from '@/components/common/PromoVideo';
import { BundlePackSection } from '@/components/home/BundlePackSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Product, Category, WebPage } from '@/lib/types';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

const commitmentLinks = [
  { href: "#", label: "Natural Ingredients" },
  { href: "#", label: "Scientifically Formulated" },
  { href: "#", label: "AI-Powered Insights" },
  { href: "#", label: "Subscription Service" },
];

export default function ProductsPage() {
  const db = useFirestore();
  
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'products'), [db]);
  const { data: pageData, isLoading: pageLoading } = useDoc<WebPage>(pageRef);

  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsRef);

  const categoriesRef = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesRef);

  const isLoading = pageLoading || productsLoading || categoriesLoading;

  const content = {
    hero: pageData?.content?.hero || {
      label: "THE PHARMLOGICS CATALOG",
      title: "Pure clinical excellence.",
      description: "Explore our curated selection of science-backed formulas designed for your specific health goals. High-bioavailability human optimization."
    }
  };

  return (
    <>
      <section className="relative h-[70vh] w-full -mt-16 bg-primary overflow-hidden">
        <PromoVideo />
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            {pageLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-16 w-3/4 bg-white/20" />
                <Skeleton className="h-4 w-full bg-white/20" />
              </div>
            ) : (
              <>
                <p className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">{content.hero.label}</p>
                <h1 className="text-4xl md:text-6xl font-headline font-normal text-white leading-[1.1]">
                  {content.hero.title}
                </h1>
                <p className="mt-6 text-xs md:text-sm text-white/90 max-w-lg font-light leading-relaxed">
                  {content.hero.description}
                </p>
              </>
            )}
          </div>
          <div className="hidden lg:flex flex-col items-end gap-4 text-right mb-4">
            {commitmentLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[10px] font-bold tracking-[0.2em] text-primary-foreground/60 transition-colors hover:text-white uppercase">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12 border-b border-border/30 pb-12">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl md:text-6xl font-headline font-normal">Our Formulas</h2>
              <p className="text-muted-foreground font-light uppercase tracking-[0.3em] text-[10px] font-bold">FILTER BY HEALTH OUTCOME</p>
            </div>
            
            <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-3">
              <TabsTrigger 
                value="all" 
                className="rounded-md px-8 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all uppercase text-[10px] font-bold tracking-[0.2em]"
              >
                All Solutions
              </TabsTrigger>
              {categoriesLoading ? (
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                categories?.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.name}
                    className="rounded-md px-8 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all uppercase text-[10px] font-bold tracking-[0.2em]"
                  >
                    {category.name}
                  </TabsTrigger>
                ))
              )}
            </TabsList>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            {isLoading ? (
              <ProductGridSkeleton />
            ) : (
              <>
                <TabsContent value="all" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>

                {categories?.map((category) => (
                  <TabsContent key={category.id} value={category.name} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {products
                        ?.filter((p) => p.category === category.name)
                        .map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {(!products || products.filter((p) => p.category === category.name).length === 0) && (
                      <div className="py-20 text-center">
                        <p className="text-muted-foreground font-light">No formulas found in this collection.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </>
            )}
          </Suspense>
        </Tabs>
      </div>

      <BundlePackSection />
    </>
  );
}
