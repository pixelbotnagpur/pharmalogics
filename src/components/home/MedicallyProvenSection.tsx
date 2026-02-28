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
                    {/* Left Column: Content */}
                    <div className="lg:col-span-3 flex flex-col py-8 lg:py-0">
                        {/* Top Aligned Content */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">{label}</p>
                            <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2 text-foreground">
                                {title}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground font-light leading-relaxed">
                                {description}
                            </p>
                        </div>
                        
                        {/* Bottom Aligned Content */}
                        <div className="mt-auto">
                             <blockquote className="relative mt-8">
                                <Avatar className="h-16 w-16 rounded-md border-4 border-background mb-4">
                                    <AvatarImage src={avatarImage.imageUrl} alt={author} data-ai-hint={avatarImage.imageHint} />
                                    <AvatarFallback>{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <p className="text-lg font-light text-foreground italic">
                                    "{quote}"
                                </p>
                                <cite className="block text-right mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    — {author}
                                </cite>
                            </blockquote>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="lg:col-span-7 relative aspect-[14/9] w-full rounded-2xl overflow-hidden">
                        <Image
                            src={runnerImage.imageUrl}
                            alt="Medically Proven"
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            data-ai-hint={runnerImage.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
