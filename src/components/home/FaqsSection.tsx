
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ModernAnimatedButton } from "@/components/ui/ModernAnimatedButton";


const faqs = [
    {
        question: "What are your shipping policies?",
        answer: "We offer free standard shipping on all orders over $50 within the US. For orders under $50, a flat rate of $5 applies. Expedited shipping options are available at checkout. Orders are typically processed within 1-2 business days."
    },
    {
        question: "Are your supplements third-party tested for purity and potency?",
        answer: "Yes, absolutely. Every batch of our supplements is rigorously tested by independent, third-party laboratories to ensure the highest quality, purity, and potency. We believe in full transparency, and certificates of analysis are available upon request."
    },
    {
        question: "How does the 'Subscribe & Save' program work?",
        answer: "Our subscription program is designed for your convenience. You save 15% on every order and get your favorite supplements delivered automatically at the frequency you choose (30, 60, or 90 days). You can easily modify, pause, or cancel your subscription at any time from your account dashboard."
    },
    {
        question: "What is your return policy?",
        answer: "We stand behind our products with a 30-day money-back guarantee. If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund, no questions asked. Please contact our support team to initiate a return."
    }
]

export function FaqsSection() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-10 gap-12">
            <div className="md:col-span-3">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Frequently Asked Questions</p>
                <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2">
                    Have Questions?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Find answers to common questions about our products, shipping, and policies. If you can't find what you're looking for, feel free to contact us.
                </p>
                 <ModernAnimatedButton href="/faqs" className="mt-8">
                    View All FAQs
                </ModernAnimatedButton>
            </div>
            <div className="md:col-span-7">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-light text-left hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </div>
    </section>
  )
}
