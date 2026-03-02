'use client';

import { AnimatedWords } from './AnimatedWords';
import { SectionHeader } from '@/components/common/SectionHeader';

interface WhyWeExistSectionProps {
  label?: string;
  animatedText?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function WhyWeExistSection({
  label = "OUR PHILOSOPHY",
  animatedText = "We exist to empower your health journey with pure, potent supplements. Science-backed formulas that fuel performance, support recovery, and keep you sharp. Every day.",
  subtext = "Science-backed formulas for real-world results. Discover how we help you operate at your peak.",
  ctaLabel = "VIEW OUR STORY",
  ctaHref = "/about"
}: WhyWeExistSectionProps) {
  return (
    <section className="py-12 md:py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4">
        <SectionHeader 
          index="02"
          title={label}
          description={subtext}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          refId="ETHOS.SYSTEM.01"
        />
        
        <div>
            <AnimatedWords 
                text={animatedText} 
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-headline font-normal leading-[1.1]"
            />
        </div>
      </div>
    </section>
  );
}
