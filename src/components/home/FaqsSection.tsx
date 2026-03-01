'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function FaqsSection() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'faqs'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  // Flatten all questions from all CMS sections for the homepage registry
  const dynamicFaqs = useMemo(() => {
    if (!pageData?.content?.sections) return [];
    
    return pageData.content.sections.reduce((acc: any[], section: any) => {
      if (section.questions) {
        return [...acc, ...section.questions];
      }
      return acc;
    }, []);
  }, [pageData]);

  // High-integrity fallbacks if CMS node is uninitialized
  const fallbackFaqs = [
    {
      q: "What are your shipping policies?",
      a: "We offer free standard shipping on all orders over $50 within the US. For orders under $50, a flat rate of $5 applies. Orders are typically processed within 1-2 business days."
    },
    {
      q: "Are your supplements third-party tested?",
      a: "Yes, absolutely. Every batch is rigorously tested by independent, third-party laboratories to ensure the highest clinical quality, purity, and potency."
    }
  ];

  const displayFaqs = dynamicFaqs.length > 0 ? dynamicFaqs : fallbackFaqs;

  return (
    <section className="py-12 md:py-24 bg-background border-t border-border/10" id="faqs">
      <div className="container mx-auto px-4">
        <SectionHeader 
          index="07"
          title="SUPPORT REGISTRY"
          description="Frequently asked questions regarding our clinical protocols and logistics."
          ctaLabel="VIEW ALL FAQS"
          ctaHref="/faqs"
          refId="REG.SUPPORT.NODE"
        />
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Syncing Support Registry...</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {displayFaqs.slice(0, 6).map((faq: any, index: number) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-border/40">
                <AccordionTrigger className="text-lg md:text-xl font-light text-left hover:no-underline py-8">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light text-base md:text-lg leading-relaxed pb-8">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}
