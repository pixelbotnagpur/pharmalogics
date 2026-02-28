'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';

export function CategoryHighlightsSection() {
  const db = useFirestore();
  const categoriesRef = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories, isLoading } = useCollection<Category>(categoriesRef);

  const displayCategories = categories?.slice(0, 4) || [];

  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px]">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
          ) : displayCategories.length > 0 ? (
            displayCategories.map((cat, i) => (
              <Link key={cat.id} href={`/products/category/${cat.slug}`}>
                <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-white group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 h-full">
                  <CardContent className="p-8 flex flex-col h-full relative">
                    <div className="relative h-40 w-full mb-8 rounded-xl bg-muted/5 p-4 transition-colors group-hover:bg-muted/10">
                      <Image 
                        src={cat.imageSrc} 
                        alt={cat.name} 
                        fill 
                        className="object-contain" 
                        data-ai-hint={cat.imageHint}
                      />
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 mb-4 h-[4.5rem]">
                      <h3 className="text-3xl font-headline font-normal tracking-wide text-primary line-clamp-2">
                        {cat.name.toUpperCase()}
                      </h3>
                      <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0 mt-1">
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {cat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground font-light italic">Taxonomy registry empty. Please initialize in Admin.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
