'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMegaMenu } from '@/hooks/use-mega-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';

interface MegaMenuProps {
  commitmentLinks: { href: string; label: string }[];
}

export function MegaMenu({ commitmentLinks }: MegaMenuProps) {
  const db = useFirestore();
  const { isMegaMenuOpen, handleMegaMenuEnter, handleMegaMenuLeave } = useMegaMenu();

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  return (
    <AnimatePresence>
      {isMegaMenuOpen && (
        <motion.div
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed top-16 inset-x-0 bg-background shadow-2xl rounded-b-xl z-40 border-t-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 pt-10 pb-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-start mb-6 px-2">
                    <span className="font-headline text-3xl md:text-4xl font-normal text-foreground leading-tight">Explore Our Solutions</span>
                      <div className="flex flex-col items-end gap-1.5 text-right">
                        {commitmentLinks.map((link) => (
                            <Link key={link.label} href={link.href} className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground uppercase tracking-wider">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {categories?.slice(0, 4).map((category) => (
                    <Link key={category.id} href={`/products/category/${category.slug}`} className="group/button">
                        <Card className="overflow-hidden h-full bg-card rounded-lg border-0 shadow-sm group-hover/button:bg-card/80 transition-colors">
                            <CardContent className="p-6 flex flex-col gap-6 h-full">
                                <div className="flex items-center justify-between">
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <Image src={category.imageSrc} alt={category.name} fill className="object-contain" data-ai-hint={category.imageHint} sizes="96px" />
                                    </div>
                                    <div className={cn(
                                      "flex-shrink-0 rounded-md h-8 w-8 flex items-center justify-center bg-accent text-accent-foreground transition-colors duration-300",
                                      "group-hover/button:bg-accent/90"
                                    )}>
                                      <span className="relative inline-block overflow-hidden h-4 w-4">
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 transition-transform duration-500 ease-out group-hover/button:-translate-y-full group-hover/button:translate-x-full" />
                                        <ArrowUpRight className="absolute left-0 top-0 h-4 w-4 translate-y-full -translate-x-full transition-transform duration-500 ease-out group-hover/button:translate-y-0 group-hover/button:translate-x-0" />
                                      </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-headline text-xl font-normal text-foreground leading-tight">{category.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                                        {category.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    ))}
                </div>
                
              <div className="mt-8">
                <Button asChild variant="accent" className="w-full text-sm font-bold uppercase py-2 h-12 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/products">Shop All Products <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
