'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/1080/1080`, imageHint: "placeholder" };
};

const policyNavItems = [
  { label: 'Delivery & Returns', href: '/delivery-and-returns', active: false },
  { label: 'Terms & Conditions', href: '/terms-and-conditions', active: false },
  { label: 'Privacy Policy', href: '/privacy-policy', active: false },
  { label: 'Cookie Policy', href: '/cookie-policy', active: false },
  { label: 'Contact', href: '/contact', active: false },
  { label: 'FAQs', href: '/faqs', active: true },
];

export default function FaqsPage() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'faqs'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);
  const [activeSection, setActiveSection] = useState("");

  const faqData = pageData?.content?.sections || [
    {
      id: "general",
      title: "General Questions",
      questions: [
        { q: "Are Pharmlogics products vegan?", a: "Yes, our core formulas are 100% vegan." },
        { q: "Do they contain sugar?", a: "We avoid artificial sweeteners." }
      ]
    }
  ];

  useEffect(() => {
    if (faqData.length > 0 && !activeSection) setActiveSection(faqData[0].id);
    
    const handleScroll = () => {
      const sections = faqData.map((s: any) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(faqData[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [faqData, activeSection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 100, behavior: "smooth" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full -mt-16 bg-primary overflow-hidden">
        <Image 
          src={getImage('dosage_background').imageUrl} 
          alt="Support Background" 
          fill 
          className="object-cover opacity-40 grayscale"
          priority
          data-ai-hint="abstract laboratory"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">SUPPORT REGISTRY</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">Frequently Asked <br className="hidden md:block" /> Questions</h1>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 mb-4">
            {policyNavItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  item.active 
                    ? "bg-primary text-white shadow-lg" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="hidden lg:block lg:col-span-3 sticky top-24 z-20">
            <div className="bg-card rounded-xl p-2 border shadow-sm">
              <nav className="flex flex-col">
                {faqData.map((section: any) => (
                  <button 
                    key={section.id} 
                    onClick={() => scrollToSection(section.id)} 
                    className={cn(
                      "text-left px-6 py-4 text-sm font-light transition-all rounded-lg flex items-center gap-3", 
                      activeSection === section.id ? "bg-primary text-primary-foreground font-normal" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {activeSection === section.id && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    {section.title}
                  </button>
                ))}
              </nav>
              <div className="p-6 mt-4 border-t">
                <p className="text-xs leading-relaxed text-muted-foreground font-light">Don't see the answers? <Link href="/contact" className="underline hover:text-primary transition-colors">Reach out</Link>.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-24">
            {faqData.map((section: any) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-3xl font-headline font-normal mb-8 text-foreground pb-4 border-b border-border/30">{section.title}</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {section.questions.map((item: any, index: number) => (
                    <AccordionItem key={index} value={`${section.id}-${index}`} className="border-b border-border/50 px-0">
                      <AccordionTrigger className="text-lg md:text-xl font-light text-left hover:no-underline py-8 group"><span className="flex-1 pr-8">{item.q}</span></AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base md:text-lg leading-relaxed pb-8 pr-12 font-light">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
