'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AboutHero } from '@/components/about/AboutHero';
import { OurStory } from '@/components/about/OurStory';
import { EthosOfImpact } from '@/components/about/EthosOfImpact';
import { ValuesGrid } from '@/components/about/ValuesGrid';
import { EditorialReview } from '@/components/about/EditorialReview';
import { CommunitySection } from '@/components/about/CommunitySection';
import { ContactBanner } from '@/components/about/ContactBanner';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/1080/1080`, imageHint: "placeholder" };
};

const commitmentLinks = [
  { href: "/products", label: "Shop Our Formulas" },
  { href: "/faqs", label: "Science & Efficacy" },
  { href: "#", label: "Sustainability" },
  { href: "/dashboard", label: "Subscriptions" },
];

const contactInfo = [
  { label: 'Email Support', value: 'concierge@pharmlogics.com' },
  { label: 'Business Inquiry', value: 'registration #PL-24000447' },
  { label: 'Lab Location', value: 'Miami, Florida, USA' },
];

export default function AboutPage() {
  const db = useFirestore();
  const pageRef = useMemoFirebase(() => doc(db, 'pages', 'about'), [db]);
  const { data: pageData, isLoading } = useDoc<WebPage>(pageRef);

  // Deep fallback for clinical data integrity
  const raw = pageData?.content || {};
  
  const content = {
    hero: raw.hero || {
      missionLabel: "OUR MISSION",
      title: "Engineering the Future of Wellness.",
      description: "We've combined the rigor of pharmaceutical standards with the wisdom of botanical medicine to create a new category: High-Bioavailability Human Optimization."
    },
    story: raw.story || {
      label: "OUR STORY",
      title: "Bridging the gap between pharmaceutical rigor and botanical potential.",
      paragraphs: [
        "Pharmlogics was born from a singular observation: the supplement industry was broken. For decades, consumers have been forced to choose between the cold precision of synthetic medicine and the often-unproven promises of natural wellness. We saw an opportunity to build a bridge.",
        "Founded by Dr. Elena Thorne, a clinical researcher with a background in molecular biology, Pharmlogics is built on the principle of High-Bioavailability. It’s not just about what you ingest; it’s about what your cells actually absorb."
      ],
      quote: "Pharmlogics is built for those who refuse to compromise on their biology. We are the architects of your vitality.",
      author: "Dr. Elena Thorne, Founder"
    },
    values: raw.values || {
      label: "OUR VALUES",
      items: [
        { title: 'FOCUS', description: 'Precision formulas designed for cognitive clarity.', iconId: 'value_abstract_1' },
        { title: 'VITALITY', description: 'Fueling cellular energy and metabolic health.', iconId: 'value_abstract_2' },
        { title: 'IMMUNITY', description: 'Strengthening your biological defenses.', iconId: 'value_abstract_3' },
        { title: 'MOBILITY', description: 'Supporting joint integrity and recovery.', iconId: 'why_exist_1' },
      ]
    },
    ethos: raw.ethos || {
      label: "OUR ETHOS OF IMPACT",
      title: "Intentionally sourced. Scientifically sustained.",
      items: [
        { title: 'Sourced with Intention', content: 'We select our raw materials from global FDA-registered facilities.' },
        { title: 'Lightweight Pouch Design', content: 'Our signature flexible pouches use 80% less plastic.' }
      ]
    },
    editorial: raw.editorial || {
      title: "Clinical & Nutritional Oversight",
      content: "Trust is our most important ingredient. Every Pharmlogics formula undergoes rigorous review by our lead nutritionist, Brooke Aaron (MS, RDN, LDN), alongside our clinical research team."
    },
    community: raw.community || {
      label: "WE ARE PHARMLOGICS",
      title: "We see you.",
      paragraphs: [
        "You’re the high-performer who demands more. Pharmlogics doesn't exist just to sell bottles; we exist to fuel that journey."
      ],
      ctaLabel: "EXPLORE OUR FORMULAS",
      ctaHref: "/products"
    },
    contact: raw.contact || {
      title: "How can we help your journey?",
      disclaimer: "*These statements have not been evaluated by the Food and Drug Administration."
    }
  };

  // Transform value items to resolve icon objects from IDs if necessary
  // Priorities: Custom uploaded icon (CMS) > Static iconId (Seeding) > Default fallback
  const processedValueItems = (content.values.items || []).map((item: any) => ({
    ...item,
    icon: item.icon || (item.iconId ? getImage(item.iconId) : getImage('value_abstract_1'))
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F2ED]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const ethosImage = content.ethos.imageUrl ? { imageUrl: content.ethos.imageUrl, imageHint: 'clinical ethos' } : getImage('ethos_leaf');
  const communityImage = content.community.imageUrl ? { imageUrl: content.community.imageUrl, imageHint: 'community' } : getImage('why_exist_2');

  return (
    <div className="flex flex-col bg-[#F5F2ED] text-foreground min-h-screen">
      <AboutHero 
        missionLabel={content.hero.missionLabel}
        title={content.hero.title}
        description={content.hero.description}
        links={commitmentLinks}
        bgImageUrl={content.hero.bgImageUrl}
      />

      <OurStory 
        label={content.story.label}
        title={content.story.title}
        paragraphs={content.story.paragraphs}
        quote={content.story.quote}
        author={content.author}
      />

      <EthosOfImpact 
        label={content.ethos.label}
        title={content.ethos.title}
        items={content.ethos.items}
        image={ethosImage}
      />

      <ValuesGrid 
        label={content.values.label || "OUR VALUES"}
        values={processedValueItems}
      />

      <EditorialReview 
        title={content.editorial.title}
        content={content.editorial.content}
      />

      <CommunitySection 
        label={content.community.label}
        title={content.community.title}
        paragraphs={content.community.paragraphs}
        image={communityImage}
        ctaLabel={content.community.ctaLabel}
        ctaHref={content.community.ctaHref}
      />

      <ContactBanner 
        title={content.contact.title}
        info={contactInfo}
        disclaimer={content.contact.disclaimer}
      />
    </div>
  );
}
