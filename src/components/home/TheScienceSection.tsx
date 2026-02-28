'use client';

import { useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SciencePoint } from './SciencePoint';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface SciencePointData {
  title: string;
  description: string;
}

interface TheScienceSectionProps {
  label?: string;
  title?: string;
  points?: SciencePointData[];
}

export function TheScienceSection({
  label = "THE SCIENCE",
  title = "Clinical Grade Bioavailability",
  points = []
}: TheScienceSectionProps) {
  const db = useFirestore();
  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  const relatedProductsRef = useRef(null);
  const showRelatedTitle = useInView(relatedProductsRef, { margin: "-25% 0px -75% 0px" });

  const dynamicRelatedProducts = products?.filter(p => 
    ['Joint Health', 'Relaxation & Sleep', 'Heart & Brain'].includes(p.category)
  ).slice(0, 3) || [];

  return (
    <section className="min-h-screen py-12 md:py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Column: Scrollable Content */}
          <div className="relative">
            <div className={cn(
              "sticky top-24 z-10 h-24 transition-colors duration-300",
              !showRelatedTitle && "bg-primary"
            )}>
              <AnimatePresence initial={false}>
                {!showRelatedTitle && (
                  <motion.div
                    key="fitness-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary-foreground/60">
                      {label}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-headline font-normal mt-2">
                      {title}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
           
            {/* Description Content */}
            <div className="relative mt-8">
              <div className="space-y-16">
                {points.map((point, index) => (
                  <SciencePoint key={index} title={point.title} description={point.description} />
                ))}
              </div>
              
              {/* Related Products */}
              <div ref={relatedProductsRef} className="mt-24">
                  <h4 className="text-3xl md:text-4xl font-headline font-normal mb-8">Related Protocols</h4>
                  <div className="grid grid-cols-1 gap-4">
                      {isLoading ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin opacity-20" />
                        </div>
                      ) : dynamicRelatedProducts.map(product => (
                           <Link href={`/products/${product.id}`} key={product.id} className="group">
                              <Card className="overflow-hidden h-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-none rounded-xl">
                                  <CardContent className="p-4 flex items-center gap-4 h-full">
                                      <div className="relative h-16 w-16 flex-shrink-0 bg-white/10 rounded-lg">
                                          <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" data-ai-hint={product.imageHint} sizes="64px" />
                                      </div>
                                      <div className="flex-1">
                                          <h4 className="font-headline text-lg font-normal text-white leading-tight">{product.name}+</h4>
                                          <p className="text-[9px] text-white/60 uppercase tracking-widest mt-1">{product.category}</p>
                                      </div>
                                      <Button size="icon" variant="secondary" className="h-8 w-8 ml-auto flex-shrink-0 bg-white/10 hover:bg-white text-white hover:text-primary transition-all">
                                          <Plus className="h-4 w-4" />
                                      </Button>
                                  </CardContent>
                              </Card>
                           </Link>
                      ))}
                  </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Video */}
          <div className="relative h-full hidden md:block">
            <div className="sticky top-24 w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              <video
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
                autoPlay
                loop
                muted
                playsInline
              ></video>
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
