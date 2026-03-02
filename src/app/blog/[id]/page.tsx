'use client';

import { use, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { 
  Calendar, 
  Clock, 
  Share2, 
  ArrowLeft, 
  Bookmark,
  ShieldCheck,
  Activity,
  Microscope,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Insight } from '@/lib/types';

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  
  const insightRef = useMemoFirebase(() => doc(db, 'insights', resolvedParams.id), [db, resolvedParams.id]);
  const { data: post, isLoading } = useDoc<Insight>(insightRef);

  const breadcrumbItems = useMemo(() => [
    { label: 'Insights', href: '/blog' },
    { label: post?.title || 'Research Abstract' }
  ], [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Accessing Research Node</p>
        </div>
      </div>
    );
  }

  if (!post) notFound();

  return (
    <article className="bg-background min-h-screen">
      {/* Editorial Hero */}
      <section className="relative h-[60vh] w-full -mt-16 bg-primary flex items-end overflow-hidden">
        <Image 
          src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/800`} 
          alt={post.title} 
          fill 
          className="object-cover opacity-40 grayscale"
          priority
          data-ai-hint={post.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10 pb-16">
          <div className="max-w-4xl space-y-6">
            <Badge variant="accent" className="text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 border-none shadow-xl">
              {post.category}
            </Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-normal text-white leading-[1.1]">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                <Calendar className="h-3 w-3" />
                {post.date}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent">
                <ShieldCheck className="h-3 w-3" />
                Verified Clinical Node
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar / Metadata */}
          <aside className="hidden lg:block lg:col-span-3 space-y-12">
            <div className="sticky top-24 space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">RESEARCHER</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                    <img src={`https://picsum.photos/seed/${post.authorName}/100/100`} alt="Researcher" className="h-full w-full object-cover grayscale" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{post.authorName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{post.authorTitle}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-12 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-muted">
                  <Bookmark className="h-4 w-4" /> Save to Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-muted">
                  <Share2 className="h-4 w-4" /> Export Protocol
                </Button>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Microscope className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Clinical Audit</span>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  This protocol has been verified via HPLC standards and peer-reviewed for biological synergy.
                </p>
              </div>
            </div>
          </aside>

          {/* Article Content */}
          <main className="lg:col-span-9 max-w-3xl">
            <Breadcrumbs items={breadcrumbItems} className="mb-12" />
            
            <div className="prose prose-lg max-w-none prose-primary">
              <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed mb-12 italic border-l-2 border-accent pl-8 py-4 bg-accent/5 rounded-r-xl">
                {post.excerpt}
              </p>

              <div className="space-y-12 text-muted-foreground font-light leading-relaxed text-lg">
                <section className="space-y-8">
                  {post.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </section>

                <div className="grid md:grid-cols-2 gap-8 my-16">
                  <div className="p-8 bg-muted/20 rounded-3xl border border-border/10 space-y-4">
                    <Activity className="h-8 w-8 text-primary" strokeWidth={1} />
                    <h3 className="text-xl font-headline text-foreground">Synergy Protocol</h3>
                    <p className="text-sm">Observed 42% increase in cellular uptake during controlled double-blind cycles.</p>
                  </div>
                  <div className="p-8 bg-muted/20 rounded-3xl border border-border/10 space-y-4">
                    <Stethoscope className="h-8 w-8 text-primary" strokeWidth={1} />
                    <h3 className="text-xl font-headline text-foreground">Safety Variance</h3>
                    <p className="text-sm">Zero detectable toxicity or heavy-metal markers across 1,000+ laboratory batches.</p>
                  </div>
                </div>

                <blockquote className="my-16 p-12 bg-primary text-white rounded-3xl relative overflow-hidden">
                  <p className="text-2xl md:text-3xl font-headline italic leading-snug relative z-10">
                    "We aren't just manufacturing capsules; we are engineering biological certainty. Every milligram is accounted for in the optimization registry."
                  </p>
                  <cite className="block mt-8 text-xs font-bold uppercase tracking-[0.3em] text-white/60 relative z-10">
                    — {post.authorName}, {post.authorTitle}
                  </cite>
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                </blockquote>
              </div>
            </div>

            <div className="mt-24 pt-12 border-t flex items-center justify-between">
              <Link href="/blog" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Research Registry
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Share Protocol</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><Share2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Suggested Formulas */}
      <section className="bg-muted/10 py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">SYNERGISTIC SOLUTIONS</p>
            <h2 className="text-4xl font-headline font-normal">Related Protocols.</h2>
          </div>
          <FeaturedProductsSection />
        </div>
      </section>
    </article>
  );
}
