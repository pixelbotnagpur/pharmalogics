'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PromoVideo } from '@/components/common/PromoVideo';

interface AboutHeroProps {
  missionLabel: string;
  title: React.ReactNode;
  description: string;
  links: { href: string; label: string }[];
  bgImageUrl?: string;
}

export function AboutHero({ missionLabel, title, description, links, bgImageUrl }: AboutHeroProps) {
  // Robust Media Detection Protocol
  const isVideo = bgImageUrl?.endsWith('.mp4') || bgImageUrl?.includes('video/upload');

  return (
    <section className="relative h-[70vh] w-full -mt-16 bg-primary overflow-hidden">
      {bgImageUrl ? (
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video 
              src={bgImageUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute top-0 left-0 w-full h-full object-cover opacity-60" 
            />
          ) : (
            <Image 
              src={bgImageUrl} 
              alt="Hero background" 
              fill 
              className="object-cover opacity-60" 
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/30 z-10" />
        </div>
      ) : (
        <PromoVideo />
      )}
      
      <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
        <div className="max-w-4xl">
          <p className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">
            {missionLabel}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-normal text-white leading-[1.1]">
            {title}
          </h1>
          <p className="mt-6 text-xs md:text-sm text-white/90 max-w-lg font-light leading-relaxed">
            {description}
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end gap-4 text-right mb-4">
          {links.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="text-[10px] font-bold tracking-[0.2em] text-primary-foreground/60 transition-colors hover:text-white uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
