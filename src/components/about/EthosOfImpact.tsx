'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EthosItem {
  title: string;
  content: string;
}

interface EthosOfImpactProps {
  label: string;
  title: React.ReactNode;
  items: EthosItem[];
  image: { imageUrl: string; imageHint: string };
}

export function EthosOfImpact({ label, title, items, image }: EthosOfImpactProps) {
  return (
    <section className="py-12 md:py-16 bg-[#ECE9E2]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-10 gap-16 items-stretch">
          <div className="lg:col-span-3 flex flex-col py-8 lg:py-0 min-h-full">
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mb-6">
                {label}
              </p>
              <h2 className="text-4xl md:text-5xl font-headline font-normal leading-tight">
                {title}
              </h2>
            </div>

            <div className="mt-auto">
              <Accordion type="single" collapsible className="w-full space-y-0">
                {items.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-border px-0 first:border-t">
                    <AccordionTrigger className="text-lg font-light py-5 hover:no-underline flex justify-between">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm font-light leading-relaxed pb-5">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="lg:col-span-7 relative aspect-[14/9] w-full rounded-2xl overflow-hidden">
            <Image 
              src={image.imageUrl} 
              alt="Ethos detail" 
              fill 
              className="object-cover" 
              data-ai-hint={image.imageHint}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
