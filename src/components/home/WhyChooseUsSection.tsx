'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  HeartPulse, 
  Leaf, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Microscope,
  Fingerprint,
  Verified
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseUsSectionProps {
  label: string;
  title: string;
  description: string;
  benefits?: BenefitItem[];
}

const ICON_MAP: Record<string, any> = {
  'Leaf': Leaf,
  'HeartPulse': HeartPulse,
  'Bot': Bot,
  'Truck': Truck,
  'ShieldCheck': ShieldCheck,
  'Sparkles': Sparkles,
  'Activity': Activity,
  'Microscope': Microscope
};

export function WhyChooseUsSection({
  label,
  title,
  description,
  benefits = []
}: WhyChooseUsSectionProps) {
  const displayBenefits = benefits.length > 0 ? benefits : [
    { icon: 'Leaf', title: 'Natural Ingredients', description: 'Our supplements are made from high-quality, natural sources to ensure maximum botanical potency.' },
    { icon: 'HeartPulse', title: 'Scientifically Formulated', description: 'Developed by clinical experts, our formulas are backed by peer-reviewed research.' },
    { icon: 'Bot', title: 'AI-Powered Insights', description: 'We leverage neural models to ensure our inventory and your dosage protocols are always optimized.' },
    { icon: 'Truck', title: 'Subscription Service', description: 'Never miss a biological replenishment with our flexible and automated clinical delivery plans.' },
  ];

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column: Contextual Narrative */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left sticky top-32">
                <div>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary">{label}</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-normal mt-4 text-foreground leading-[1.1]">
                      {title}
                    </h2>
                </div>
                <p className="mt-8 text-xl text-muted-foreground font-light leading-relaxed max-w-lg">
                    {description}
                </p>
                
                <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                  <Fingerprint className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Biological Guarantee</p>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      Every commitment node is anchored in our clinical governance framework, ensuring 99.9% protocol integrity.
                    </p>
                  </div>
                </div>
            </div>
            
            {/* Right Column: Certificate-Style Benefits Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayBenefits.map((benefit, index) => {
                const IconComp = ICON_MAP[benefit.icon] || Sparkles;
                return (
                  <Card key={index} className="bg-card border border-border/40 shadow-sm rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500 flex flex-col h-full">
                    <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-between">
                      
                      {/* Certificate Header */}
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                          <IconComp className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/5 rounded-full border border-green-500/10">
                            <ShieldCheck className="h-3 w-3 text-green-600" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-green-700">Verified</span>
                          </div>
                          <span className="text-[7px] font-mono uppercase tracking-tighter opacity-30 text-right">NODE PL-{(index + 1).toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* Content Node */}
                      <div>
                        <h3 className="text-xl font-headline font-normal text-foreground group-hover:text-primary transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>

                      {/* Certificate Footer */}
                      <div className="pt-6 border-t border-dashed border-border/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Verified className="h-3 w-3 text-accent opacity-40" />
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Clinical Standard</span>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                      </div>
                    </CardContent>

                    {/* Aesthetic Detail: Certificate Corner Seal */}
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-accent opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-tr-2xl" />
                    </div>
                  </Card>
                );
              })}
            </div>
        </div>
      </div>
    </section>
  );
}
