import { AnimatedWords } from './AnimatedWords';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';

interface WhyWeExistSectionProps {
  label?: string;
  animatedText?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function WhyWeExistSection({
  label = "WHY WE EXIST",
  animatedText = "We exist to empower your health journey with pure, potent supplements. Science-backed formulas that fuel performance, support recovery, and keep you sharp. Every day.",
  subtext = "Science-backed formulas for real-world results. Discover how we help you operate at your peak.",
  ctaLabel = "Our Philosophy",
  ctaHref = "/about"
}: WhyWeExistSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">{label}</p>
        
        <div className="mt-8">
            <AnimatedWords 
                text={animatedText} 
                className="text-4xl md:text-6xl font-headline font-normal"
            />
        </div>

        <div className="mt-8 max-w-sm">
            <p className="text-muted-foreground">{subtext}</p>
            <ModernAnimatedButton href={ctaHref} className="mt-6">
                {ctaLabel}
            </ModernAnimatedButton>
        </div>

      </div>
    </section>
  );
}
