'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ContactInfo {
  label: string;
  value: string;
}

interface ContactBannerProps {
  title: string;
  info: ContactInfo[];
  disclaimer: string;
}

export function ContactBanner({ title, info, disclaimer }: ContactBannerProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden bg-accent text-white p-6 md:p-8">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-headline font-normal max-w-2xl leading-tight mb-8">
              {title}
            </h2>
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
              {/* Left Column: Info + Button */}
              <div className="space-y-6 w-full lg:w-auto">
                <div className="flex flex-wrap gap-x-10 gap-y-4 opacity-90">
                  {info.map((item, i) => (
                    <div key={i} className="space-y-0.5">
                      <p className="opacity-60 text-[9px] font-bold uppercase tracking-[0.2em]">{item.label}</p>
                      <p className="text-sm md:text-base font-light">{item.value}</p>
                    </div>
                  ))}
                </div>
                
                <Button variant="secondary" className="h-11 px-8 uppercase text-xs font-bold tracking-[0.2em] bg-white text-accent hover:bg-white/90">
                  GET IN TOUCH <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Right Column: Disclaimer Card */}
              <div className="w-full lg:w-auto lg:max-w-sm">
                <div className="p-5 bg-black/10 rounded-lg border border-white/10">
                  <p className="text-xs md:text-sm font-light leading-relaxed opacity-95">
                    {disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
