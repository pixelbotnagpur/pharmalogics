'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Category, StoreSettings } from '@/lib/types';

const defaultBg = PlaceHolderImages.find(p => p.id === 'mega_menu_bg') || { imageUrl: 'https://picsum.photos/seed/mega_menu_bg/1920/1080', imageHint: 'abstract background' };

export function BottomMegaMenu() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading } = useDoc<StoreSettings>(settingsRef);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const commitmentLinks = [
    { href: "#", label: "Natural Ingredients" },
    { href: "#", label: "Scientifically Formulated" },
    { href: "#", label: "AI-Powered Insights" },
    { href: "#", label: "Subscription Service" },
  ];

  // Logic: Avoid flash by not pre-calculating the URL with a fallback until we know the dynamic state
  const bgUrl = settings ? (settings.megaMenuBgUrl || defaultBg.imageUrl) : null;
  const isVideo = bgUrl?.endsWith('.mp4') || bgUrl?.includes('video/upload');

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-0 h-screen flex flex-col justify-end bg-primary overflow-hidden"
    >
        {/* Background Media - Only rendered once synchronization is complete */}
        {!isLoading && bgUrl && (
          <>
            {isVideo ? (
              <video 
                src={bgUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute top-0 left-0 w-full h-full object-cover" 
              />
            ) : (
              <Image
                src={bgUrl}
                alt="Floor-layer background"
                fill
                className="object-cover"
                data-ai-hint="abstract background"
                sizes="100vw"
                priority={false}
              />
            )}
          </>
        )}
        
        {/* Secondary Color Overlay Registry */}
        <div className="absolute inset-0 bg-secondary/80" />

        <div className="relative z-10 overflow-y-auto max-h-screen w-full" data-lenis-prevent>
            <div className="container mx-auto px-4 pt-8 pb-10 md:pt-12 md:pb-16 h-full flex flex-col justify-center">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-4">
                    <span className="font-headline text-2xl md:text-4xl font-normal text-white">Explore Our Solutions</span>
                    <div className="hidden md:flex flex-col items-start md:items-end gap-1.5">
                        {commitmentLinks.map((link) => (
                            <Link key={link.label} href={link.href} className="text-xs md:text-sm font-light text-primary-foreground/80 transition-colors hover:text-white uppercase tracking-wider">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-2 md:mt-4">
                    {categories?.slice(0, 4).map((category) => (
                    <Link key={category.id} href={`/products/category/${category.slug}`} className="group/button block min-w-0">
                        <Card className="overflow-hidden h-full bg-black/20 rounded-lg border-0 shadow-none group-hover/button:bg-black/40 transition-colors">
                            <CardContent className="p-4 md:p-5 flex flex-col items-start md:items-stretch gap-4 md:gap-5 h-full">
                                <div className="flex items-center justify-between w-full">
                                    <div className="relative w-14 h-14 md:w-24 md:h-24 flex-shrink-0">
                                        <Image src={category.imageSrc} alt={category.name} fill className="object-contain" data-ai-hint={category.imageHint} sizes="96px" />
                                    </div>
                                    <div className={cn(
                                        "flex flex-shrink-0 rounded-md h-7 w-7 md:h-8 md:w-8 items-center justify-center bg-accent text-accent-foreground transition-colors duration-300",
                                        "group-hover/button:bg-accent/90"
                                    )}>
                                        <span className="relative inline-block overflow-hidden h-4 w-4">
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 transition-transform duration-500 ease-out group-hover/button:-translate-y-full group-hover/button:translate-x-full" />
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 translate-y-full -translate-x-full transition-transform duration-500 ease-out group-hover/button:translate-y-0 group-hover/button:translate-x-0" />
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-0.5 md:space-y-1.5 flex-1 min-w-0 w-full">
                                    <h4 className="font-headline text-sm md:text-xl font-normal text-white leading-tight truncate">{category.name}</h4>
                                    <p className="text-[8px] md:text-[10px] text-white/80 uppercase tracking-widest leading-relaxed line-clamp-1 md:line-clamp-none">
                                        {category.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    ))}
                </div>
                
                <div className="mt-4 md:mt-6">
                    <Button asChild variant="accent" className="w-full text-xs md:text-sm font-bold uppercase py-2 h-10 md:h-12 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/products">Shop All Products</Link>
                    </Button>
                </div>
                
                <p className="text-center text-[8px] md:text-[10px] text-primary-foreground/70 mt-4 md:mt-6 px-4 leading-relaxed max-w-2xl mx-auto italic">
                *These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
                </p>
            </div>
        </div>
    </div>
  );
}
