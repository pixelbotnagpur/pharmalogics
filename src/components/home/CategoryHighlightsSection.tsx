
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @fileOverview CategoryHighlightsSection - A high-integrity taxonomy registry.
 * Features an immersive square-module layout with dynamic data reveal on interaction.
 * Optimized for mobile visibility where hover states are unavailable.
 */
export function CategoryHighlightsSection() {
  const db = useFirestore();
  const categoriesRef = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories, isLoading } = useCollection<Category>(categoriesRef);

  const displayCategories = categories?.slice(0, 4) || [];

  return (
    <section className="bg-background py-12 md:py-24" id="taxonomy">
      <div className="container mx-auto px-4">
        <SectionHeader 
          index="05"
          title="CLINICAL TAXONOMY"
          description="Biological classification nodes for targeted human optimization."
          ctaLabel="EXPLORE REGISTRY"
          ctaHref="/products"
          refId="REG.TAXONOMY.CORE"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
          ) : displayCategories.length > 0 ? (
            displayCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/products/category/${cat.slug}`} className="group block">
                  <Card className="relative aspect-square border border-border/40 shadow-none rounded-2xl bg-white overflow-hidden transition-all duration-500 hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/5">
                    
                    {/* Visual Node - Split 50/50 on Mobile, Full-to-Split on Desktop */}
                    <div className={cn(
                      "absolute top-0 left-0 w-full overflow-hidden transition-all duration-700 ease-clinical bg-primary/[0.02]",
                      "h-1/2 md:h-full md:group-hover:h-1/2"
                    )}>
                      <div className="relative w-full h-full transition-all duration-700 ease-clinical">
                        <Image 
                          src={cat.imageSrc} 
                          alt={cat.name} 
                          fill 
                          className="object-cover transition-transform duration-700 ease-clinical md:group-hover:scale-105" 
                          data-ai-hint={cat.imageHint}
                        />
                      </div>
                      
                      {/* Technical Identifier Tag - Persistent on mobile, fade-on-hover on desktop */}
                      <div className="absolute top-4 left-4 z-10 transition-opacity duration-500 opacity-100 md:group-hover:opacity-0">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/10 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
                            NODE.0{i + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Node - Persistent on Mobile, Clipped Reveal on Desktop */}
                    <div className={cn(
                      "absolute bottom-0 left-0 w-full h-1/2 bg-white flex flex-col transition-all duration-700 ease-clinical border-t border-dashed border-primary/10",
                      "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]", // Persistent mobile state
                      "md:[clip-path:polygon(0_100%,100%_100%,100%_100%,0_100%)]", // Desktop hidden state
                      "md:group-hover:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" // Desktop reveal state
                    )}>
                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        {/* Identity Header */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-accent">Clinical Node</p>
                              <h3 className="text-lg md:text-xl font-headline font-normal tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                                {cat.name}
                              </h3>
                            </div>
                            <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                              <Plus className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                            </div>
                          </div>

                          <p className="text-[11px] md:text-xs text-muted-foreground font-light leading-relaxed line-clamp-3">
                            {cat.description}
                          </p>
                        </div>

                        {/* Registry Footer - Action Trigger */}
                        <div className="pt-4 border-t border-dashed border-border/30 flex items-center justify-between group/footer">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary transition-all duration-500 group-hover/footer:translate-x-1">
                            Explore Registry
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary opacity-40 group-hover/footer:opacity-100 transition-all duration-500" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border/40">
              <p className="text-sm text-muted-foreground font-light italic">Taxonomy registry node empty. Synchronizing...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
