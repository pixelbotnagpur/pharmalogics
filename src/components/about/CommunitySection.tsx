'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CommunitySectionProps {
  label: string;
  title: string;
  paragraphs: string[];
  image: { imageUrl: string; imageHint: string };
  ctaLabel: string;
  ctaHref: string;
}

export function CommunitySection({ label, title, paragraphs, image, ctaLabel, ctaHref }: CommunitySectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-10 gap-16 items-stretch">
          {/* Image Column */}
          <div className="lg:col-span-7 relative aspect-[14/9] w-full rounded-2xl overflow-hidden group cursor-pointer">
            {/* Base Layer: High-integrity Grayscale */}
            <Image 
              src={image.imageUrl} 
              alt="Community" 
              fill 
              className="object-cover grayscale transition-transform duration-1000 group-hover:scale-105"
              data-ai-hint={image.imageHint}
            />
            
            {/* Reveal Layer: Clinical Color Reveal from Left to Right */}
            <div className="absolute inset-0 transition-all duration-700 ease-clinical [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] overflow-hidden">
              <Image 
                src={image.imageUrl} 
                alt="Community Reveal" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-3 flex flex-col py-8 lg:py-0 min-h-full">
            {/* Top Aligned: Label and Title */}
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mb-6">
                {label}
              </p>
              <h2 className="text-4xl md:text-5xl font-headline font-normal leading-tight">
                {title}
              </h2>
            </div>
            
            {/* Bottom Aligned: Paragraphs and CTA */}
            <div className="mt-auto space-y-10">
              <div className="space-y-6 text-sm font-light text-muted-foreground leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <Button asChild className="h-14 w-full px-10 rounded-md bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all">
                <Link href={ctaHref} className="flex items-center justify-center">
                  {ctaLabel} <Plus className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
