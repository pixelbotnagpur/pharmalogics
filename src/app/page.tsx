
'use client';

import { CategoryHighlightsSection } from '@/components/home/CategoryHighlightsSection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { HeroSection } from '@/components/home/HeroSection';
import { TheScienceSection } from '@/components/home/TheScienceSection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { WhyWeExistSection } from '@/components/home/WhyWeExistSection';
import { BundlePackSection } from '@/components/home/BundlePackSection';
import { MedicallyProvenSection } from '@/components/home/MedicallyProvenSection';
import { DosageComparisonSection } from '@/components/home/DosageComparisonSection';
import { FaqsSection } from '@/components/home/FaqsSection';
import { BlogSection } from '@/components/home/BlogSection';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const db = useFirestore();
  const homeRef = useMemoFirebase(() => doc(db, 'pages', 'home'), [db]);
  const { data: homeData, isLoading } = useDoc<WebPage>(homeRef);

  // High-Integrity Fallbacks with Section-Level Resilience
  const rawContent = homeData?.content || {};
  
  const content = {
    hero: rawContent.hero || {
      title: "Elevate Your Wellness Journey",
      description: "Discover premium, science-backed supplements designed for your health goals. Natural, potent, and pure.",
      ctaLabel: "Shop All Products",
      ctaHref: "/products"
    },
    narrative: rawContent.narrative || {
      label: "WHY WE EXIST",
      animatedText: "We exist to empower your health journey with pure, potent supplements. Science-backed formulas that fuel performance, support recovery, and keep you sharp. Every day.",
      subtext: "Science-backed formulas for real-world results. Discover how we help you operate at your peak.",
      ctaLabel: "Our Philosophy",
      ctaHref: "/about"
    },
    science: rawContent.science || {
      label: "THE SCIENCE",
      title: "Clinical Grade Bioavailability",
      points: [
        { title: 'Peak Bioavailability', description: "Our formulas are designed for maximum absorption. We use chelated minerals and activated vitamins, so your body gets more of the good stuff." },
        { title: 'Synergistic Formulations', description: "We don't just pack ingredients together; we pair them intelligently to ensure effective utilization." },
        { title: 'Clinical-Dosage Commitment', description: "No 'fairy dusting' here. Every ingredient is included at a dosage that has been clinically studied." },
        { title: 'Purity & Transparency', description: "What's not in our supplements is just as important as what is. Third-party tested for your peace of mind." }
      ]
    },
    expert: rawContent.expert || {
      label: "MEDICALLY SUPPORTED",
      title: "Backed by Experts",
      description: "Our formulas are developed and endorsed by healthcare professionals to ensure safety and efficacy.",
      quote: "Pharmlogics reimagines the benefits of IV therapy in an oral, fast-absorbing format.",
      author: "Brooke Aaron, MS, RDN, LDN",
      avatarId: "brooke_aaron_avatar",
      mainImageId: "medically_proven_runner"
    },
    comparison: rawContent.comparison || {
      title: "IV Intent. Daily Format.",
      description: "Get the benefits of highly bioavailable nutrients in a simple, daily capsule.",
      bgImageId: "dosage_background",
      personImageId: "dosage_person",
      rows: [
        { feature: 'Safe for Daily Use', capsule: 'Yes', iv: 'No' },
        { feature: 'No Needles, No Discomfort', capsule: 'Yes', iv: 'No' },
        { feature: 'Science-Backed Absorption', capsule: 'Yes', iv: 'Yes' },
        { feature: 'Portable & On-the-Go', capsule: 'Yes', iv: 'No' },
        { feature: 'Premium, Targeted Blends', capsule: 'Yes', iv: 'Yes' },
        { feature: 'No Risk of Infection', capsule: 'Yes', iv: 'No' },
      ]
    },
    commitment: rawContent.commitment || {
      label: "OUR COMMITMENT",
      title: "Why Choose Pharmlogics?",
      description: "We are committed to providing you with the highest quality supplements to support your health and wellness.",
      benefits: [
        { icon: 'Leaf', title: 'Natural Ingredients', description: 'Our supplements are made from high-quality, natural sources to ensure purity and potency.' },
        { icon: 'HeartPulse', title: 'Scientifically Formulated', description: 'Developed by experts, our formulas are backed by science for maximum effectiveness.' },
        { icon: 'Bot', title: 'AI-Powered Insights', description: 'We leverage AI to ensure our inventory meets your needs without interruption.' },
        { icon: 'Truck', title: 'Subscription Service', description: 'Never miss a dose with our flexible and convenient subscription plans.' }
      ]
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <HeroSection 
        title={content.hero.title}
        description={content.hero.description}
        ctaLabel={content.hero.ctaLabel}
        ctaHref={content.hero.ctaHref}
      />
      <FeaturedProductsSection />
      <WhyWeExistSection 
        label={content.narrative.label}
        animatedText={content.narrative.animatedText}
        subtext={content.narrative.subtext}
        ctaLabel={content.narrative.ctaLabel}
        ctaHref={content.narrative.ctaHref}
      />
      <TheScienceSection 
        label={content.science.label}
        title={content.science.title}
        points={content.science.points}
      />
      <BundlePackSection />
      <CategoryHighlightsSection />
      
      <MedicallyProvenSection 
        label={content.expert.label}
        title={content.expert.title}
        description={content.expert.description}
        quote={content.expert.quote}
        author={content.expert.author}
        avatarId={content.expert.avatarId}
        mainImageId={content.expert.mainImageId}
      />

      <DosageComparisonSection 
        title={content.comparison.title}
        description={content.comparison.description}
        bgImageId={content.comparison.bgImageId}
        personImageId={content.comparison.personImageId}
        rows={content.comparison.rows}
      />

      <FaqsSection />

      <BlogSection />

      <WhyChooseUsSection 
        label={content.commitment.label}
        title={content.commitment.title}
        description={content.commitment.description}
        benefits={content.commitment.benefits}
      />
    </div>
  );
}
