
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromoVideo } from '@/components/common/PromoVideo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HelpCircle, ShieldCheck, Lock } from 'lucide-react';

const policyNavItems = [
  { label: 'Delivery & Returns', href: '/delivery-and-returns', active: false },
  { label: 'Terms & Conditions', href: '/terms-and-conditions', active: false },
  { label: 'Privacy Policy', href: '/privacy-policy', active: true },
  { label: 'Cookie Policy', href: '/cookie-policy', active: false },
  { label: 'Contact', href: '/contact', active: false },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['collection', 'usage', 'security', 'cookies', 'rights'];
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
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 font-bold">DATA GOVERNANCE</p>
            <h1 className="text-5xl md:text-7xl font-headline font-normal text-white leading-[1.1]">
              Privacy <br /> Policy
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
                  { id: 'collection', label: 'Data Collection' },
                  { id: 'usage', label: 'How We Use Data' },
                  { id: 'security', label: 'Security Standards' },
                  { id: 'cookies', label: 'Cookies & Tracking' },
                  { id: 'rights', label: 'Your Rights' },
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

            {/* Integrity Box */}
            <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Our Integrity</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-light">
                Pharmlogics never sells your biological or personal data to third-party marketing entities. Your trust is our most vital asset.
              </p>
            </div>
          </aside>

          {/* Content Sections */}
          <div className="lg:col-span-9 space-y-24">
            
            {/* Data Collection */}
            <section id="collection" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Data Collection</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p className="text-lg text-foreground font-normal">
                  To provide clinical-grade wellness optimization, we collect information that helps us deliver your products and refine your experience.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Personal Information</h4>
                    <p className="text-sm">This includes your name, email, shipping address, and phone number, which are essential for fulfilling your orders and providing tracking updates.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Biological Optimization Data</h4>
                    <p className="text-sm">We may collect data regarding your wellness goals or product preferences to provide AI-powered insights and personalized dosage recommendations.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage */}
            <section id="usage" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">How We Use Data</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p>
                  At Pharmlogics, data usage is strictly limited to improving your physiological outcomes and operational efficiency.
                </p>
                <ul className="space-y-4 list-none p-0">
                  <li className="flex items-start gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span><strong className="text-foreground font-medium">Order Fulfillment:</strong> Processing transactions and managing your high-bioavailability supplement subscriptions.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span><strong className="text-foreground font-medium">AI Insights:</strong> Our predictive algorithms analyze inventory trends to ensure your formulas are always in stock.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span><strong className="text-foreground font-medium">Clinical Updates:</strong> Sending you peer-reviewed research and news regarding formula breakthroughs.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Security Standards</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <div className="p-8 bg-card border rounded-2xl space-y-4 flex flex-col md:flex-row gap-8 items-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-normal text-foreground mb-2">Encryption & Safeguards</h3>
                    <p>
                      We utilize industry-standard SSL/TLS encryption for all data transfers. Your payment information is processed through PCI-compliant gateways and is never stored directly on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Cookies & Tracking</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p>
                  We use cookies to maintain your shopping bag across sessions and to understand how our community interacts with our clinical research.
                </p>
                <p>
                  You can manage your cookie preferences through your browser settings. Please note that disabling cookies may impact your ability to utilize certain features of the Pharmlogics dashboard.
                </p>
              </div>
            </section>

            {/* Rights */}
            <section id="rights" className="scroll-mt-24">
              <h2 className="text-4xl md:text-5xl font-headline font-normal mb-8 pb-4 border-b border-border/30">Your Rights</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-light leading-relaxed space-y-6">
                <p className="text-lg text-foreground font-normal">
                  You maintain full sovereignty over your data.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Access</h4>
                    <p className="text-xs">Request a copy of all personal data we hold about you.</p>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Correction</h4>
                    <p className="text-xs">Update or rectify any inaccuracies in your account details.</p>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Erasure</h4>
                    <p className="text-xs">Request the permanent deletion of your data from our systems.</p>
                  </div>
                </div>
                <div className="pt-8 text-center md:text-left">
                  <p className="text-sm font-light italic">
                    To exercise any of these rights, please contact our data protection officer at <span className="text-primary underline">privacy@pharmlogics.com</span>.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
