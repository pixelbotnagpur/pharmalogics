'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';

const productFaqs = [
  {
    question: "When should I take this supplement?",
    answer: "For optimal results, we recommend taking it with a meal to enhance absorption, unless otherwise directed by your healthcare professional."
  },
  {
    question: "Can I take this with other medications?",
    answer: "While our formulas are natural, we always advise consulting with your doctor before starting any new supplement regimen if you are currently taking prescription medication."
  },
  {
    question: "Is this product vegan-friendly?",
    answer: "Most of our products are vegan. Please check the 'Other Ingredients' section for specific details like vegetable cellulose capsules versus gelatin."
  },
  {
    question: "How should I store this product?",
    answer: "Store in a cool, dry place away from direct sunlight. Ensure the pouch or bottle is tightly sealed after every use to maintain potency."
  }
];

export function ProductFaqs() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-10 gap-12">
          <div className="md:col-span-3">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Product Support</p>
            <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2">
              Product FAQs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about using our formulas for optimal results.
            </p>
            <div className="mt-8">
              <ModernAnimatedButton href="/faqs">
                View All FAQs
              </ModernAnimatedButton>
            </div>
          </div>
          <div className="md:col-span-7">
            <Accordion type="single" collapsible className="w-full">
              {productFaqs.map((faq, index) => (
                <AccordionItem value={`product-faq-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-light text-left hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
