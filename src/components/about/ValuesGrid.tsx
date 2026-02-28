'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface ValueItem {
  title: string;
  description: string;
  icon?: { imageUrl: string; imageHint: string };
}

interface ValuesGridProps {
  label: string;
  values: ValueItem[];
}

export function ValuesGrid({ label, values }: ValuesGridProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mb-12">
          {label}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(values || []).map((value, i) => (
            <Card key={i} className="border-none shadow-none rounded-2xl overflow-hidden bg-white group cursor-default transition-all duration-500 hover:scale-[1.02]">
              <CardContent className="p-8 flex flex-col h-full relative">
                <div className="relative h-40 w-full mb-8">
                  {value.icon?.imageUrl && (
                    <Image 
                      src={value.icon.imageUrl} 
                      alt={value.title || "Value Icon"} 
                      fill 
                      className="object-contain" 
                      data-ai-hint={value.icon.imageHint || "abstract 3d"}
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-3xl font-headline font-normal tracking-wide text-primary">
                    {value.title}
                  </h3>
                  <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
