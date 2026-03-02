'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Calendar, Clock, Loader2, ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Insight } from '@/lib/types';

export function BlogSection() {
  const db = useFirestore();
  
  const insightsQuery = useMemoFirebase(() => {
    return query(collection(db, 'insights'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: allInsights, isLoading } = useCollection<Insight>(insightsQuery);

  const insights = useMemo(() => {
    if (!allInsights) return [];
    return allInsights
      .filter(post => post.published)
      .slice(0, 3);
  }, [allInsights]);

  return (
    <section className="py-12 md:py-24 bg-white border-t border-border/10" id="blog">
      <div className="container mx-auto px-4">
        <SectionHeader 
          index="08"
          title="RESEARCH REGISTRY"
          description="Peer-reviewed insights and biological optimization protocols."
          ctaLabel="VIEW ALL PROTOCOLS"
          ctaHref="/blog"
          refId="LAB.INSIGHTS.NODE"
        />

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20 mx-auto" />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group">
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
                      READ PROTOCOL <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground italic font-light">
            Latest clinical research is currently being synchronized with our lab nodes.
          </div>
        )}
      </div>
    </section>
  );
}
