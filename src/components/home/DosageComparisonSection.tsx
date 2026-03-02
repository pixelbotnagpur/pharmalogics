'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ComparisonRow {
  feature: string;
  capsule: string;
  iv: string;
}

interface DosageComparisonSectionProps {
  title: string;
  description: string;
  bgImageId?: string;
  bgImageUrl?: string;
  personImageId?: string;
  personImageUrl?: string;
  rows?: ComparisonRow[];
}

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/1920/1080`, imageHint: "placeholder" };
}

export function DosageComparisonSection({
  title,
  description,
  bgImageId = 'dosage_background',
  bgImageUrl,
  personImageId = 'dosage_person',
  personImageUrl,
  rows = []
}: DosageComparisonSectionProps) {
  const backgroundImage = bgImageUrl ? { imageUrl: bgImageUrl, imageHint: 'background' } : getImage(bgImageId);
  const personImage = personImageUrl ? { imageUrl: personImageUrl, imageHint: 'subject' } : getImage(personImageId);

  const displayRows = rows.length > 0 ? rows : [
    { feature: 'Safe for Daily Use', capsule: 'Yes', iv: 'No' },
    { feature: 'No Needles, No Discomfort', capsule: 'Yes', iv: 'No' },
    { feature: 'Science-Backed Absorption', capsule: 'Yes', iv: 'Yes' },
    { feature: 'Portable & On-the-Go', capsule: 'Yes', iv: 'No' },
    { feature: 'Premium Blends', capsule: 'Yes', iv: 'Yes' },
    { feature: 'No Risk of Infection', capsule: 'Yes', iv: 'No' },
  ];

  return (
    <section className="relative w-full bg-primary text-white flex items-center py-16 md:py-24 lg:py-0 lg:min-h-screen">
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage.imageUrl}
          alt="Abstract background"
          fill
          className="object-cover opacity-40 transition-opacity duration-1000"
          data-ai-hint={backgroundImage.imageHint}
          sizes="100vw"
        />
        {/* Optimized Overlay Protocol */}
        <div className="absolute inset-0 bg-black/30 backdrop-brightness-75 transition-all duration-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full w-full">
        {/* Parent Grid set to items-stretch to force matching column heights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 h-full items-stretch">
          
          {/* Left Column: Contextual Narrative & Portrait */}
          <div className="lg:col-span-5 flex flex-col justify-between py-12 lg:py-20">
            {/* Top Aligned Text Node */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-headline font-normal text-white leading-tight">
                {title}
              </h2>
              <p className="text-xl text-white/70 font-light max-w-sm leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Bottom Aligned Portrait Node */}
            <div className="relative aspect-[3/4] w-full max-w-[200px] hidden lg:block rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl mt-12">
              <Image
                src={personImage.imageUrl}
                alt="Portrait"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                data-ai-hint={personImage.imageHint}
                sizes="200px"
              />
            </div>
          </div>

          {/* Right Column: Comparison Matrix Module */}
          <div className="lg:col-span-7 flex items-center justify-center py-12 lg:py-20">
            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
              {/* Header Protocol */}
              <div className="grid grid-cols-3 gap-4 pb-6">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Capsule</h3>
                </div>
                <div className="col-span-1 text-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">IV Drip</h3>
                </div>
              </div>

              {/* Matrix Rows */}
              <div className="space-y-6">
                {displayRows.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center border-t border-white/10 pt-6 group transition-all duration-300 hover:bg-white/[0.02] -mx-4 px-4 rounded-lg">
                    <div className="col-span-1">
                      <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-white/60 group-hover:text-white transition-colors">{item.feature}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-headline text-xl md:text-2xl text-accent">{item.capsule}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-headline text-xl md:text-2xl text-white/30">{item.iv}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Module Footer Metadata */}
               <div className="grid grid-cols-3 gap-4 items-center border-t border-white/10 pt-6 mt-6 opacity-40">
                    <div className="col-span-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest">Protocol Format</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[10px] font-bold uppercase">Oral Bio-Softgel</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[10px] font-bold uppercase">Clinical Infusion</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
