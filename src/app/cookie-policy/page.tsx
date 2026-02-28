
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromoVideo } from '@/components/common/PromoVideo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HelpCircle, ShieldCheck, Cookie } from 'lucide-react';

const policyNavItems = [
  { label: 'Delivery & Returns', href: '/delivery-and-returns', active: false },
  { label: 'Terms & Conditions', href: '/terms-and-conditions', active: false },
  { label: 'Privacy Policy', href: '/privacy-policy', active: false },
  { label: 'Cookie Policy', href: '/cookie-policy', active: true },
  { label: 'Contact', href: '/contact', active: false },
];

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'what', 'types', 'third-party', 'control'];
      const scrollPosition = window.scrollY + 200;

      for (const id of sections.reverse()) {
        const element = document.getElementById(id);
        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full -mt-16 bg-primary overflow-hidden">
        <PromoVideo />
        <div className="relative z-20 h-full flex items-end justify-between text-left p-8 md:p-16">
          <div className="max-w-3xl">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">DIGITAL INTEGRITY</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">
              Cookie <br /> Policy
            </h1>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-8">
            <div className="bg-card rounded-xl p-2 border shadow-sm">
              <nav className="flex flex-col">
                {[
                  { id: 'intro', label: 'Introduction' },
                  { id: 'what', label: 'What are Cookies' },
                  { id: 'types', label: 'Types of Cookies' },
                  { id: 'third-party', label: 'Third-Party Use' },
                  { id: 'control', label: 'Managing Choice' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left px-6 py-4 text-sm font-light transition-all rounded-lg flex items-center justify-between group",
                      activeSection === section.id ? "bg-primary text-primary-foreground font-normal" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span>{section.label}</span>
                    {activeSection === section.id && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                  </button>
                ))}
              </nav>
            </div>

            {/* Support Box */}
            <div className="p-6 bg-accent/5 border border-accent/10 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <HelpCircle className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Questions?</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-light">
                Unclear about how we use your digital data? Our team is available to explain our data governance standards.
              </p>
              <Button asChild variant="accent" size="sm" className="w-full text-[10px] font-bold tracking-widest h-10 hover:bg-primary transition-all duration-300">
                <Link href="/contact">CONTACT CONCIERGE</Link>
              </Button>
            </div>
          </aside>

          {/* Content Sections */}
          <div className="lg:col-span-9 space-y-24">
            
            {/* Introduction */}
            <section id="intro" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Introduction</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p className="text-lg text-foreground font-normal">
                  At Pharmlogics Healthcare, we believe transparency is the foundation of wellness. This policy explains how we use cookies and similar technologies to optimize your experience.
                </p>
                <p>
                  By using our website, you consent to our use of cookies as described in this policy. We use these technologies to ensure our digital platform operates efficiently and provides you with personalized insights for your optimization journey.
                </p>
              </div>
            </section>

            {/* What are Cookies */}
            <section id="what" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">What are Cookies?</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <div className="p-8 bg-card border rounded-2xl space-y-4 flex flex-col md:flex-row gap-8 items-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Cookie className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-normal text-foreground mb-2">Digital Identifiers</h3>
                    <p>
                      Cookies are small text files stored on your device that help websites recognize you. They allow us to remember your preferences, keep your shopping bag intact, and understand how you interact with our clinical research.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Types of Cookies */}
            <section id="types" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Types of Cookies</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Essential Cookies</h4>
                    <p className="text-sm leading-relaxed">Necessary for the website to function. They enable core features like secure log-ins, cart management, and payment processing. These cannot be disabled.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Performance Cookies</h4>
                    <p className="text-sm leading-relaxed">Help us understand how visitors use Pharmlogics by collecting anonymous data. This allows us to improve our platform's speed and reliability.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Functional Cookies</h4>
                    <p className="text-sm leading-relaxed">Remember your choices—like your language preference or region—to provide a more personalized browsing experience.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Targeting Cookies</h4>
                    <p className="text-sm leading-relaxed">Used to deliver relevant wellness content and advertisements based on your interests. They also limit the number of times you see an ad.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Third Party Use */}
            <section id="third-party" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Third-Party Use</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p>
                  We may partner with third-party service providers (such as Google Analytics) who place cookies on our website to provide us with analytical data or help us deliver personalized advertisements.
                </p>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Our Integrity</span>
                  </div>
                  <p className="text-xs italic">
                    We strictly audit our third-party partners to ensure they adhere to high data privacy standards and do not sell your personal information.
                  </p>
                </div>
              </div>
            </section>

            {/* Managing Choice */}
            <section id="control" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Managing Choice</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p className="text-lg text-foreground font-normal">
                  You maintain full sovereignty over your digital data.
                </p>
                <p>
                  Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline them if you prefer. However, please note that disabling cookies may prevent you from taking full advantage of the Pharmlogics platform, such as maintaining a persistent shopping bag.
                </p>
                <div className="pt-8">
                  <Button asChild variant="outline" className="px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <Link href="/contact">REQUEST DATA AUDIT</Link>
                  </Button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
