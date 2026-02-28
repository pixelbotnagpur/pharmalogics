
'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { FeaturedIngredient, IngredientItem } from '@/lib/types';

interface IngredientsProps {
  featuredIngredients?: FeaturedIngredient[];
  fullIngredientsList?: IngredientItem[];
}

export function Ingredients({ 
  featuredIngredients = [], 
  fullIngredientsList = [] 
}: IngredientsProps) {
  
  const hasFeatured = featuredIngredients.length > 0;
  const hasFullList = fullIngredientsList.length > 0;

  if (!hasFeatured && !hasFullList) return null;

  return (
    <div className="space-y-8">
      {hasFeatured && (
        <div>
          <h3 className="font-light text-sm uppercase tracking-wider text-muted-foreground mb-6">Key Bioactive Components</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {featuredIngredients.map(ingredient => (
              <div key={ingredient.name} className="group">
                <div className="relative aspect-[3/2] w-full rounded-md overflow-hidden bg-muted/20">
                  <Image 
                    src={ingredient.imageUrl} 
                    alt={ingredient.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    sizes="30vw" 
                    data-ai-hint={ingredient.imageHint} 
                  />
                </div>
                <h4 className="mt-4 font-normal text-foreground">{ingredient.name}</h4>
                <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">{ingredient.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFullList && (
        <Accordion type="single" collapsible className="w-full border-t border-border/30">
          <AccordionItem value="full-ingredients" className="border-b-0">
            <AccordionTrigger className="py-4 font-light text-sm uppercase tracking-widest hover:no-underline">Full Ingredient Disclosure</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-w-2xl">
                {fullIngredientsList.map((ing, idx) => (
                  <div key={`${ing.name}-${idx}`} className="flex justify-between items-center py-2 border-b border-dashed border-border/20 last:border-0">
                    <p className="font-light text-sm text-muted-foreground">{ing.name}</p>
                    <p className="text-xs font-bold text-foreground tabular-nums">{ing.amount}</p>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-muted/20 rounded-md">
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                    *Percent Daily Values are based on a 2,000 calorie diet. <br />
                    † Daily Value (DV) not established.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
