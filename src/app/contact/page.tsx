'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Mail, MapPin, Clock, ArrowRight, Building2, Globe, Loader2 } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/1080/1080`, imageHint: "placeholder" };
};

const ICON_MAP: Record<string, any> = {
  'Email Support': Mail,
  'Business Inquiry': Building2,
  'Lab Location': MapPin,
  'Support Hours': Clock,
};

const policyNavItems = [
  { label: 'Delivery & Returns', href: '/delivery-and-returns', active: false },
  { label: 'Terms & Conditions', href: '/terms-and-conditions', active: false },
  { label: 'Privacy Policy', href: '/privacy-policy', active: false },
  { label: 'Cookie Policy', href: '/cookie-policy', active: false },
  { label: 'Contact', href: '/contact', active: true },
  { label: 'FAQs', href: '/faqs', active: false },
];

export default function ContactPage() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'contact'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  const content = pageData?.content || {
    hero: { title: "Clinical Concierge", label: "GET IN TOUCH" },
    details: [
      { label: 'Email Support', value: 'concierge@pharmlogics.com', desc: 'For order inquiries.' },
      { label: 'Business Inquiry', value: 'registration #PL-24000447', desc: 'For partnerships.' },
      { label: 'Lab Location', value: 'Miami, Florida, USA', desc: 'Our primary facility.' },
      { label: 'Support Hours', value: 'Mon – Fri, 9am – 6pm EST', desc: 'Assist your journey.' }
    ]
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="bg-background min-h-screen">
      <section className="relative h-[60vh] w-full -mt-16 bg-primary overflow-hidden">
        <Image 
          src={getImage('dosage_background').imageUrl} 
          alt="Contact Background" 
          fill 
          className="object-cover opacity-40 grayscale"
          priority
          data-ai-hint="abstract laboratory"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">{content.hero.label}</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">{content.hero.title}</h1>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 mb-4">
            {policyNavItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", 
                  item.active ? "bg-primary text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-12">
            <div><h2 className="text-3xl font-headline font-normal mb-4">Connect with us.</h2><p className="text-muted-foreground font-light leading-relaxed">Whether you're a high-performer seeking guidance or a retail partner, we're here to help.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {content.details.map((item: any, i: number) => {
                const Icon = ICON_MAP[item.label] || Mail;
                return (
                  <div key={i} className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><Icon className="h-5 w-5" /></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p><p className="text-sm font-medium text-foreground mb-1">{item.value}</p><p className="text-xs text-muted-foreground font-light leading-relaxed">{item.desc}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="p-8 bg-accent/5 border border-accent/10 rounded-2xl space-y-4"><div className="flex items-center gap-2 text-accent"><Globe className="h-5 w-5" /><span className="text-[10px] font-bold uppercase tracking-widest">Global Reach</span></div><p className="text-sm text-muted-foreground font-light leading-relaxed">We ship to US, UK, and Canada. For international distribution, contact our business team.</p></div>
          </div>
          <div className="lg:col-span-7">
            <Card className="border-none shadow-none bg-card rounded-3xl overflow-hidden"><CardContent className="p-8 md:p-12"><form className="space-y-6"><div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label>First Name</Label><Input placeholder="Jane" className="h-12 bg-muted/30 border-none" /></div><div className="space-y-2"><Label>Last Name</Label><Input placeholder="Doe" className="h-12 bg-muted/30 border-none" /></div></div><div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jane@example.com" className="h-12 bg-muted/30 border-none" /></div><div className="space-y-2"><Label>Message</Label><Textarea placeholder="How can we assist your journey?" className="min-h-[150px] bg-muted/30 border-none resize-none" /></div><Button type="submit" className="w-full h-14 text-sm font-bold tracking-widest uppercase bg-primary hover:bg-primary/90 rounded-xl group">Send Message <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></form></CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
