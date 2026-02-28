'use client';

import { use, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PromoVideo } from '@/components/common/PromoVideo';
import { BundlePackSection } from '@/components/home/BundlePackSection';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-1/4" />
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

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();
  
  // 1. Declare all Hooks at the top level
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const category = useMemo(() => {
    return categories?.find(c => c.slug === slug);
  }, [categories, slug]);

  const filteredProducts = useMemo(() => {
    if (!products || !category) return [];
    return products.filter(p => p.category === category.name);
  }, [products, category]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Products', href: '/products' },
    { label: category?.name || 'Category' },
  ], [category]);

  const isLoading = productsLoading || categoriesLoading;

  // 2. Early returns after all hooks are declared
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Retrieving Taxonomy Node</p>
        </div>
      </div>
    );
  }

  if (!category) {
    notFound();
  }

  return (
    <>
      <section className="relative h-[70vh] w-full -mt-16 bg-primary overflow-hidden">
        <PromoVideo />
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">COLLECTION / {category.name.toUpperCase()}</p>
            <h1 className="text-4xl md:text-6xl font-headline font-normal text-white leading-[1.1]">
              {category.name}
            </h1>
            <p className="mt-6 text-xs md:text-sm text-white/90 max-w-lg font-light leading-relaxed">
              {category.description}
            </p>
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

      <div className="container mx-auto px-4 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-12">
            <h2 className="text-4xl font-headline font-normal">Explore the Collection</h2>
            <p className="text-muted-foreground font-light uppercase tracking-[0.3em] text-[10px] font-bold mt-2">Targeted solutions for your vitality</p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground font-light italic">No formulas have been assigned to this clinical category yet.</p>
                </div>
            )}
        </Suspense>
      </div>

      <BundlePackSection />
    </>
  );
}
