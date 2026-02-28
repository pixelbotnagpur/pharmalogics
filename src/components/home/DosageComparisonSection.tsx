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
  personImageId?: string;
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
  personImageId = 'dosage_person',
  rows = []
}: DosageComparisonSectionProps) {
  const backgroundImage = getImage(bgImageId);
  const personImage = getImage(personImageId);

  const displayRows = rows.length > 0 ? rows : [
    { feature: 'Safe for Daily Use', capsule: 'Yes', iv: 'No' },
    { feature: 'No Needles, No Discomfort', capsule: 'Yes', iv: 'No' },
    { feature: 'Science-Backed Absorption', capsule: 'Yes', iv: 'Yes' },
    { feature: 'Portable & On-the-Go', capsule: 'Yes', iv: 'No' },
    { feature: 'Premium Blends', capsule: 'Yes', iv: 'Yes' },
  ];

  return (
    <section className="relative w-full bg-primary text-white flex items-center py-16 md:py-24 lg:py-0 lg:min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage.imageUrl}
          alt="Abstract background"
          fill
          className="object-cover opacity-20"
          data-ai-hint={backgroundImage.imageHint}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between self-stretch py-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-headline font-normal text-white leading-tight">
                {title}
              </h2>
              <p className="mt-6 text-xl text-white/70 font-light max-w-sm leading-relaxed">
                {description}
              </p>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-[280px] mt-12 hidden lg:block rounded-2xl overflow-hidden border-2 border-white/10">
              <Image
                src={personImage.imageUrl}
                alt="Portrait"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                data-ai-hint={personImage.imageHint}
                sizes="280px"
              />
            </div>
          </div>

          {/* Right Column (Comparison Table) */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 pb-6">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Capsule</h3>
                </div>
                <div className="col-span-1 text-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">IV Drip</h3>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-6">
                {displayRows.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center border-t border-white/10 pt-6 group">
                    <div className="col-span-1">
                      <p className="text-xs uppercase font-bold tracking-widest text-white/60 group-hover:text-white transition-colors">{item.feature}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-headline text-xl text-accent">{item.capsule}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-headline text-xl text-white/30">{item.iv}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
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
