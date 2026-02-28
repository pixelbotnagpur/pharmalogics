'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';
import { ArrowRight, Calendar, Clock, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Insight } from '@/lib/types';

export function BlogSection() {
  const db = useFirestore();
  
  // Use a simple query to avoid composite index requirement for published/updatedAt
  const insightsQuery = useMemoFirebase(() => {
    return query(collection(db, 'insights'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: allInsights, isLoading } = useCollection<Insight>(insightsQuery);

  // Perform filtering and limiting on the client to guarantee data flow
  const insights = useMemo(() => {
    if (!allInsights) return [];
    return allInsights
      .filter(post => post.published)
      .slice(0, 3);
  }, [allInsights]);

  return (
    <section className="py-12 md:py-24 bg-white" id="blog">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">LATEST RESEARCH</p>
            <h2 className="text-4xl md:text-6xl font-headline font-normal leading-tight">Clinical Insights.</h2>
          </div>
          <div className="shrink-0">
            <ModernAnimatedButton href="/blog" variant="accent">
              VIEW ALL PROTOCOLS
            </ModernAnimatedButton>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20 mx-auto" />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {insights.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group">
                <Card className="border-none shadow-none bg-transparent overflow-hidden rounded-none h-full flex flex-col">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl mb-8">
                    <Image 
                      src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`} 
                      alt={post.title} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
                      data-ai-hint={post.imageHint}
                    />
                    <div className="absolute top-4 left-4">
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
