
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { DetailedBenefit } from '@/lib/types';

interface ProductAccordionsProps {
  detailedBenefits?: DetailedBenefit[];
  usageInstructions?: string[];
  deliveryInfo?: string;
  sustainabilityInfo?: string;
}

export function ProductAccordions({ 
  detailedBenefits = [], 
  usageInstructions = [], 
  deliveryInfo, 
  sustainabilityInfo 
}: ProductAccordionsProps) {
  
  const hasBenefits = detailedBenefits.length > 0;
  const hasUsage = usageInstructions.length > 0;

  return (
    <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
      {hasBenefits && (
        <AccordionItem value="item-0">
          <AccordionTrigger>Benefits</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {detailedBenefits.map((benefit, index) => (
                  <div key={index}>
                    <h4 className="font-light uppercase tracking-wider text-foreground">{benefit.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {hasUsage && (
        <AccordionItem value="item-usage">
          <AccordionTrigger>Usage</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-muted-foreground font-light">
              <p>For optimal results, we recommend the following daily routine:</p>
              <ul className="list-disc pl-5 space-y-2">
                {usageInstructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="item-delivery">
        <AccordionTrigger>Delivery</AccordionTrigger>
        <AccordionContent className="font-light text-muted-foreground leading-relaxed">
          {deliveryInfo || "Free shipping on all orders over $50. Orders are processed within 1-2 business days from our clinical facility."}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-sustainability">
        <AccordionTrigger>Sustainability</AccordionTrigger>
        <AccordionContent className="font-light text-muted-foreground leading-relaxed">
          {sustainabilityInfo || "Our signatures flexible pouches use 80% less plastic than traditional bottles. Fully recyclable and lightweight."}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
