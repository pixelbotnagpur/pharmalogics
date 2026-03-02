'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PromoVideo } from '@/components/common/PromoVideo';
import { Calendar, Clock, ArrowRight, Microscope, Filter, X, Loader2 } from 'lucide-react';
import { BlogCategorySheet } from '@/components/blog/BlogCategorySheet';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Insight } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function BlogIndexPage() {
  const db = useFirestore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch all insights ordered by date
  const insightsQuery = useMemoFirebase(() => {
    return query(collection(db, 'insights'), orderBy('updatedAt', 'desc'));
  }, [db]);
  
  const { data: allInsights, isLoading } = useCollection<Insight>(insightsQuery);

  const insights = useMemo(() => {
    if (!allInsights) return [];
    return allInsights.filter(post => post.published);
  }, [allInsights]);

  const breadcrumbItems = [
    { label: 'Insights' }
  ];

  const categories = useMemo(() => {
    if (!insights) return [];
    return Array.from(new Set(insights.map(post => post.category)));
  }, [insights]);

  const filteredPosts = useMemo(() => {
    if (!insights) return [];
    if (!activeCategory) return insights;
    return insights.filter(post => post.category === activeCategory);
  }, [insights, activeCategory]);

  return (
    <div className="bg-background min-h-screen">
      {/* Editorial Hero */}
      <section className="relative h-[60vh] w-full -mt-16 bg-primary overflow-hidden">
        <PromoVideo />
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">THE RESEARCH REGISTRY</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">
              Clinical <br /> Insights.
            </h1>
            <p className="mt-6 text-xs md:text-sm text-white/90 max-w-lg font-light leading-relaxed">
              Explore the biological blueprints and laboratory breakthroughs behind the Pharmlogics standard. 
              Peer-reviewed research for human optimization.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-8 md:pt-12 pb-16 md:pb-24">
        <Breadcrumbs items={breadcrumbItems} className="mb-12" />
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-headline font-normal leading-tight">
              {activeCategory ? `${activeCategory} Protocols.` : 'Latest Research.'}
            </h2>
            <p className="text-muted-foreground font-light mt-4">
              Our clinical team regularly publishes protocols and abstracts focused on cellular health, cognitive performance, and systemic recovery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-10 px-6 rounded-full border border-primary/20 text-[10px] font-bold uppercase tracking-widest transition-all",
                isFilterOpen || activeCategory ? "bg-primary text-white" : "bg-white text-primary hover:bg-primary/5"
              )}
            >
              <Filter className="h-3 w-3 mr-2" />
              {activeCategory || 'Filter Protocols'}
              {activeCategory && (
                <span 
                  onClick={(e) => { e.stopPropagation(); setActiveCategory(null); }}
                  className="ml-2 hover:text-accent transition-colors"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <Microscope className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab-Verified Updates</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-40">Synchronizing Research registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/blog/${post.id}`} className="group">
                    <Card className="border-none shadow-none bg-transparent overflow-hidden rounded-none h-full flex flex-col">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl mb-8">
                        {/* Base Layer: High-integrity Grayscale */}
                        <Image 
                          src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`} 
                          alt={post.title} 
                          fill 
                          className="object-cover grayscale transition-transform duration-1000 group-hover:scale-110"
                          data-ai-hint={post.imageHint}
                        />
                        
                        {/* Reveal Layer: Clinical Color Reveal from Left to Right */}
                        <div className="absolute inset-0 transition-all duration-700 ease-clinical [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] overflow-hidden">
                          <Image 
                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`} 
                            alt={post.title} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        </div>

                        <div className="absolute top-4 left-4 z-20">
                          <Badge variant="accent" className="text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 shadow-lg border-none">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-0 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {post.date}
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-headline font-normal leading-tight group-hover:text-primary transition-colors mb-4">
                          {post.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2 mb-8">
                          {post.excerpt}
                        </p>
                        
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary group-hover:translate-x-1 transition-transform duration-500">
                          READ FULL PROTOCOL <ArrowRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-muted-foreground font-light italic">No research nodes found for this clinical classification.</p>
            <Button variant="link" onClick={() => setActiveCategory(null)} className="mt-4 text-primary font-bold uppercase text-[10px] tracking-widest">Reset Registry</Button>
          </div>
        )}
      </div>

      <BlogCategorySheet 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
    </div>
  );
}
