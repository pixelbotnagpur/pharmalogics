import { PromoVideo } from '@/components/common/PromoVideo';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';

interface HeroSectionProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function HeroSection({ 
  title = "Elevate Your Wellness Journey", 
  description = "Discover premium, science-backed supplements designed for your health goals. Natural, potent, and pure.",
  ctaLabel = "Shop All Products",
  ctaHref = "/products"
}: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full -mt-16 bg-primary">
      <PromoVideo />
      <div className="relative z-20 h-full flex items-end justify-start text-left">
        <div className="p-8 md:p-16 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-headline font-normal text-white">
            {title}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl">
            {description}
          </p>
          <ModernAnimatedButton href={ctaHref} className="mt-8" variant="accent">
            {ctaLabel}
          </ModernAnimatedButton>
        </div>
      </div>
    </section>
  );
}
