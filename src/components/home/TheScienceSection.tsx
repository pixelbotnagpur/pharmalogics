
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Plus, Loader2, Microscope, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SciencePoint } from './SciencePoint';
import { SectionHeader } from '@/components/common/SectionHeader';
import type { Product, StoreSettings } from '@/lib/types';
import { motion } from 'framer-motion';

interface SciencePointData {
  title: string;
  description: string;
}

interface TheScienceSectionProps {
  label?: string;
  title?: string;
  points?: SciencePointData[];
}

const ICON_MAP = [Microscope, Activity, ShieldCheck, Zap];

export function TheScienceSection({
  label = "THE SCIENCE",
  title = "Clinical Grade Bioavailability",
  points = []
}: TheScienceSectionProps) {
  const db = useFirestore();
  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);
  const currencySymbol = settings?.currencySymbol || '$';

  const dynamicRelatedProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      ['Joint Health', 'Relaxation & Sleep', 'Heart & Brain'].includes(p.category)
    ).slice(0, 3);
  }, [products]);

  return (
    <section className="relative py-24 md:py-32 bg-primary text-white" id="science">
      {/* Abstract Background Noise/Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Modular Header - Global Section Anchor */}
        <SectionHeader 
          index="03"
          title={label}
          variant="inverted"
          refId="REG.SCIENCE.LAB.01"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mt-12 md:mt-20">
          
          {/* Left Column: Narrative Stream */}
          <div className="lg:col-span-7">
            
            {/* STACKING WRAPPER - Isolates the protocol stack logic */}
            <div className="relative pb-8">
              {/* Protocol Title - Anchored Sticky Node */}
              <div className="sticky top-24 z-10 py-4 mb-12 w-full md:whitespace-nowrap max-w-xl">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-headline font-normal leading-none text-white">
                  {title}
                </h3>
              </div>

              {/* Modular Science Points - Stacking Sticky Nodes */}
              <div className="space-y-0 relative">
                {points.map((point, index) => (
                  <div 
                    key={index} 
                    className="sticky w-full" 
                    style={{ 
                      top: `96px`, // Stacks exactly at the title's sticky coordinate
                      zIndex: 20 + index,
                      marginTop: index === 0 ? '0px' : '40px'
                    }}
                  >
                    <SciencePoint 
                      title={point.title} 
                      description={point.description} 
                      index={index}
                      icon={ICON_MAP[index % ICON_MAP.length]}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Related Protocols Registry */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-24 mt-24 border-t border-white/50"
            >
              <div className="flex items-center justify-between mb-12 gap-4">
                <h4 className="text-3xl font-headline font-normal whitespace-nowrap">Related Protocols</h4>
                <div className="h-px flex-1 bg-white/50 mx-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 whitespace-nowrap shrink-0">
                  Lab-Verified Synergies
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-10 w-10 animate-spin opacity-20" />
                  </div>
                ) : dynamicRelatedProducts.length > 0 ? (
                  dynamicRelatedProducts.map(product => (
                    <Link href={`/products/${product.id}`} key={product.id} className="group">
                      <Card className="overflow-hidden bg-white border border-white/40 hover:border-accent transition-all duration-500 rounded-2xl group/card relative shadow-none">
                        <CardContent className="p-5 flex items-center gap-6 h-full text-foreground">
                          <div className="relative h-16 w-16 flex-shrink-0 bg-muted/10 rounded-xl overflow-hidden p-2 group-hover/card:scale-105 transition-transform duration-500">
                            <Image 
                              src={product.imageUrl} 
                              alt={product.name} 
                              fill 
                              className="object-contain transition-all" 
                              sizes="64px" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-headline text-lg font-normal text-primary group-hover/card:text-accent transition-colors leading-tight truncate">
                              {product.name}+
                            </h4>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-accent" />
                                {product.category}
                              </div>
                              <span className="font-headline text-sm text-primary">{currencySymbol}{product.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 transition-all duration-500 group-hover/card:scale-110 shrink-0">
                            <Plus className="h-5 w-5 transition-transform duration-500 group-hover/card:rotate-90" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-white/30 italic font-light">Laboratory node synchronizing synergistic formulas...</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sticky Visual Protocol Container */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="sticky top-24 h-[calc(100vh-12rem)] w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-full w-full rounded-3xl overflow-hidden border border-white/30 group shadow-none"
              >
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                ></video>
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/40" />
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-accent">LIVE_CAPTURE.MOV</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">MIAMI_LAB_NODE_01</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                    <span className="text-[8px] font-mono text-white/40">FRAME_SYNC_ACTIVE</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
