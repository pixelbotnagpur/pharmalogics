'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromoVideo } from '@/components/common/PromoVideo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';

const policyNavItems = [
  { label: 'Delivery & Returns', href: '/delivery-and-returns', active: true },
  { label: 'Terms & Conditions', href: '/terms-and-conditions', active: false },
  { label: 'Privacy Policy', href: '/privacy-policy', active: false },
  { label: 'Cookie Policy', href: '/cookie-policy', active: false },
  { label: 'Contact', href: '/contact', active: false },
];

export default function DeliveryReturnsPage() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'delivery-and-returns'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);
  const [activeSection, setActiveSection] = useState('delivery');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      const sections = ['delivery', 'returns'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  const content = pageData?.content || {
    intro: "Pharmlogics delivery guidelines and clinical return protocols.",
    sections: [
      { title: "Standard Delivery", content: "Orders typically take 3-5 business days." },
      { title: "Clinical Returns", content: "Unopened products are eligible within 30 days." }
    ]
  };

  return (
    <div className="bg-background min-h-screen">
      <section className="relative h-[60vh] w-full -mt-16 bg-primary overflow-hidden">
        <PromoVideo />
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">SUPPORT & POLICIES</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">Delivery & <br /> Returns</h1>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 mb-4">
            {policyNavItems.map((item) => (
              <Link key={item.label} href={item.href} className={cn("px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", item.active ? "bg-primary text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5")}>{item.label}</Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-8">
            <div className="bg-card rounded-xl p-2 border shadow-sm">
              <nav className="flex flex-col">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={cn("text-left px-6 py-4 text-sm font-light transition-all rounded-lg flex items-center justify-between group", activeSection === 'delivery' ? "bg-primary text-primary-foreground font-normal" : "text-muted-foreground hover:bg-muted")}>
                  <span>Provision Registry</span>
                  {activeSection === 'delivery' && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                </button>
              </nav>
            </div>
            <div className="p-6 bg-accent/5 border border-accent/10 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-accent"><HelpCircle className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Need Help?</span></div>
              <p className="text-xs leading-relaxed text-muted-foreground font-light">Visit our FAQs or reach out to concierge.</p>
              <Button asChild variant="accent" size="sm" className="w-full text-[10px] font-bold tracking-widest h-10"><Link href="/contact">CONTACT US</Link></Button>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-24">
            <section id="delivery" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Registry</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p className="text-lg text-foreground font-normal">{content.intro}</p>
                {content.sections.map((s: any, i: number) => (
                  <div key={i} className="p-8 bg-card border rounded-2xl space-y-2">
                    <h3 className="text-xl font-headline font-normal text-foreground">{s.title}</h3>
                    <p className="text-sm">{s.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
