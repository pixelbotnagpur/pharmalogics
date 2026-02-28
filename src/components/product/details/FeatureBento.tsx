
'use client';

import Image from 'next/image';
import { AdvantageItem } from '@/lib/types';

interface FeatureBentoProps {
  items?: AdvantageItem[];
}

export function FeatureBento({ items }: FeatureBentoProps) {
  // Clinical Fallbacks for visual consistency
  const defaultItems: AdvantageItem[] = [
    { title: 'Science-Led Formulation', description: 'Every Pharmlogics capsule is a result of clinical research and rigorous physiological testing.', imageUrl: 'https://images.unsplash.com/photo-1579154235602-3c2c2aa5d72f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', imageHint: 'laboratory' },
    { title: 'Botanical Purity', description: 'Sourced from the cleanest, most potent natural environments.', imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', imageHint: 'botanical' },
    { title: 'Peak Bioavailability', description: 'Fast-acting nutrients designed for immediate cellular uptake.', imageUrl: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', imageHint: 'athlete' },
    { title: '3rd-Party Tested', description: 'Purity and potency verified by independent laboratory standards.', imageUrl: 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', imageHint: 'testing' },
  ];

  const nodes = items && items.length >= 4 ? items : defaultItems;

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">THE PHARMLOGICS STANDARD</p>
          <h2 className="text-4xl md:text-6xl font-headline font-normal leading-[1.1]">Engineered for <br /> Human Peak.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[1200px] md:h-[700px]">
          {/* Node 1 - Big Vertical */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-primary">
            <Image 
              src={nodes[0].imageUrl} 
              alt={nodes[0].title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 grayscale hover:grayscale-0"
              data-ai-hint={nodes[0].imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
              <h3 className="text-3xl md:text-4xl font-headline mb-4 leading-tight">{nodes[0].title}</h3>
              <p className="text-white/70 font-light max-w-sm text-sm md:text-base leading-relaxed">{nodes[0].description}</p>
            </div>
          </div>

          {/* Node 2 - Small Square */}
          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-3xl bg-accent">
            <Image 
              src={nodes[1].imageUrl} 
              alt={nodes[1].title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
              data-ai-hint={nodes[1].imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="text-xl font-headline mb-2">{nodes[1].title}</h3>
              <p className="text-xs text-white/70 font-light leading-relaxed">{nodes[1].description}</p>
            </div>
          </div>

          {/* Node 3 - Wide Horizontal (mapped to vertical block) */}
          <div className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-3xl bg-secondary">
            <Image 
              src={nodes[2].imageUrl} 
              alt={nodes[2].title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 grayscale hover:grayscale-0"
              data-ai-hint={nodes[2].imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-headline mb-3 leading-tight">{nodes[2].title}</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">{nodes[2].description}</p>
            </div>
          </div>

          {/* Node 4 - Small Square */}
          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-3xl bg-white border border-border/30">
            <Image 
              src={nodes[3].imageUrl} 
              alt={nodes[3].title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-30 grayscale"
              data-ai-hint={nodes[3].imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="text-xl font-headline mb-2">{nodes[3].title}</h3>
              <p className="text-xs text-white/70 font-light leading-relaxed">{nodes[3].description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
