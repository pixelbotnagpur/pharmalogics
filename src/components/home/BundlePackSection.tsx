'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';

export function BundlePackSection() {
  const db = useFirestore();
  const bundleRef = useMemoFirebase(() => doc(db, 'products', 'wellness-starter-kit'), [db]);
  const { data: bundle, isLoading } = useDoc<Product>(bundleRef);

  const includedItems = [
    { name: 'Multivitamin Complex', description: 'FOR OVERALL HEALTH' },
    { name: 'Omega-3 Fish Oil', description: 'FOR HEART & BRAIN' },
    { name: 'Probiotic Blend', description: 'FOR GUT HEALTH' },
    { name: 'Magnesium Glycinate', description: 'FOR RELAXATION' },
  ];

  if (isLoading) {
    return (
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
        </div>
      </section>
    );
  }

  // Fallback if the specific bundle isn't in Firestore yet
  const displayImage = bundle?.imageUrl || 'https://images.unsplash.com/photo-1740592754365-2117f5977528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
  const displayTitle = bundle?.name || 'The Wellness Starter Kit';
  const displayDesc = bundle?.description || 'Kickstart your wellness journey with our curated selection of essential supplements.';

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-10 gap-8 items-stretch">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-7 relative aspect-[14/9] w-full rounded-2xl overflow-hidden bg-primary shadow-none">
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 70vw"
              data-ai-hint="supplement bundle"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-3 flex flex-col py-8 lg:py-0">
            {/* Top Aligned Content */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">THE ULTIMATE PROTOCOL</p>
                <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2 text-foreground leading-tight">
                    {displayTitle}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground font-light leading-relaxed">
                    {displayDesc}
                </p>
            </div>

            {/* Bottom Aligned Content */}
            <div className="mt-auto pt-12">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">COMPREHENSIVE BIO-SUPPORT:</p>
              <ul className="space-y-4">
                  {includedItems.map((item, index) => (
                      <li key={index} className="flex items-baseline text-sm border-b border-dashed border-border/50 pb-2">
                          <span className="font-medium text-foreground w-40">{item.name}</span>
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground ml-auto">{item.description}</span>
                      </li>
                  ))}
              </ul>
              <Button asChild className="mt-10 w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]" size="lg">
                  <Link href={`/bundles/${bundle?.id || 'wellness-starter-kit'}`}>
                      SHOP THE KIT <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}