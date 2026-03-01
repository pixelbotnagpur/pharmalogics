'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';

const backgroundImage = PlaceHolderImages.find(p => p.id === 'mega_menu_bg') || { imageUrl: 'https://picsum.photos/seed/mega_menu_bg/1920/1080', imageHint: 'abstract background' };

export function BottomMegaMenu() {
  const db = useFirestore();
  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const commitmentLinks = [
    { href: "#", label: "Natural Ingredients" },
    { href: "#", label: "Scientifically Formulated" },
    { href: "#", label: "AI-Powered Insights" },
    { href: "#", label: "Subscription Service" },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-0 h-screen flex flex-col justify-end bg-primary"
    >
        <Image
        src={backgroundImage.imageUrl}
        alt="Abstract background"
        fill
        className="object-cover"
        data-ai-hint={backgroundImage.imageHint}
        sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/50" />

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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2 md:mt-4">
                    {categories?.slice(0, 4).map((category) => (
                    <Link key={category.id} href={`/products/category/${category.slug}`} className="group/button block">
                        <Card className="overflow-hidden h-full bg-black/20 rounded-lg border-0 shadow-none group-hover/button:bg-black/40 transition-colors">
                            <CardContent className="p-3 md:p-5 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-5 h-full">
                                <div className="flex items-center justify-between flex-1 md:flex-initial">
                                    <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0">
                                        <Image src={category.imageSrc} alt={category.name} fill className="object-contain" data-ai-hint={category.imageHint} sizes="64px" />
                                    </div>
                                    <div className={cn(
                                        "hidden md:flex flex-shrink-0 rounded-md h-7 w-7 md:h-8 md:w-8 items-center justify-center bg-accent text-accent-foreground transition-colors duration-300",
                                        "group-hover/button:bg-accent/90"
                                    )}>
                                        <span className="relative inline-block overflow-hidden h-4 w-4">
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 transition-transform duration-500 ease-out group-hover/button:-translate-y-full group-hover/button:translate-x-full" />
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 translate-y-full -translate-x-full transition-transform duration-500 ease-out group-hover/button:translate-y-0 group-hover/button:translate-x-0" />
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-0.5 md:space-y-1.5 flex-1">
                                    <h4 className="font-headline text-base md:text-xl font-normal text-white leading-tight">{category.name}</h4>
                                    <p className="text-[8px] md:text-[10px] text-white/80 uppercase tracking-widest leading-relaxed line-clamp-1 md:line-clamp-none">
                                        {category.description}
                                    </p>
                                </div>
                                <div className="md:hidden">
                                    <ArrowUpRight className="h-4 w-4 text-accent" />
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
