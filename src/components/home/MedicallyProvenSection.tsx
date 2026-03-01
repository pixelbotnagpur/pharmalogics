'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface MedicallyProvenSectionProps {
  label: string;
  title: string;
  description: string;
  quote: string;
  author: string;
  avatarId?: string;
  mainImageId?: string;
}

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/800/800`, imageHint: "placeholder" };
}

export function MedicallyProvenSection({
  label,
  title,
  description,
  quote,
  author,
  avatarId = 'brooke_aaron_avatar',
  mainImageId = 'medically_proven_runner'
}: MedicallyProvenSectionProps) {
    const runnerImage = getImage(mainImageId);
    const avatarImage = getImage(avatarId);

    return (
        <section className="bg-background py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-10 gap-8 items-stretch">
                    {/* Left Column: Content Node (Synchronized with Bundle Layout) */}
                    <div className="lg:col-span-4 flex flex-col p-8 md:p-12 lg:p-16 bg-white rounded-3xl">
                        {/* Top Aligned Content */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">{label}</p>
                            <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2 text-foreground leading-tight">
                                {title}
                            </h2>
                            <p className="mt-6 text-lg text-muted-foreground font-light leading-relaxed">
                                {description}
                            </p>
                        </div>
                        
                        {/* Bottom Aligned Content */}
                        <div className="mt-auto pt-12">
                             <blockquote className="relative">
                                <Avatar className="h-16 w-16 rounded-md border-4 border-background mb-4 shadow-sm">
                                    <AvatarImage src={avatarImage.imageUrl} alt={author} data-ai-hint={avatarImage.imageHint} />
                                    <AvatarFallback>{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <p className="text-lg font-light text-foreground italic leading-relaxed">
                                    "{quote}"
                                </p>
                                <cite className="block text-right mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                    — {author}
                                </cite>
                            </blockquote>
                        </div>
                    </div>

                    {/* Right Column: Visual Asset Node (Synchronized with Bundle Layout) */}
                    <div className="lg:col-span-6 relative aspect-[14/9] w-full rounded-3xl overflow-hidden bg-muted/10">
                        <Image
                            src={runnerImage.imageUrl}
                            alt="Medically Proven"
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            data-ai-hint={runnerImage.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/5"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
