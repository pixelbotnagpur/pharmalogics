import Image from 'next/image';
import { PromoVideo } from '@/components/common/PromoVideo';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';

interface HeroSectionProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgImageUrl?: string;
}

export function HeroSection({ 
  title = "Elevate Your Wellness Journey", 
  description = "Discover premium, science-backed supplements designed for your health goals. Natural, potent, and pure.",
  ctaLabel = "Shop All Products",
  ctaHref = "/products",
  bgImageUrl
}: HeroSectionProps) {
  // Robust Media Detection Protocol
  const isVideo = bgImageUrl?.endsWith('.mp4') || bgImageUrl?.includes('video/upload');

  return (
    <section className="relative h-screen w-full -mt-16 bg-primary">
      {bgImageUrl ? (
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video 
              src={bgImageUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute top-0 left-0 w-full h-full object-cover opacity-60" 
            />
          ) : (
            <Image 
              src={bgImageUrl} 
              alt="Hero background" 
              fill 
              className="object-cover opacity-60" 
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/30 z-10" />
        </div>
      ) : (
        <PromoVideo />
      )}
      
      <div className="relative z-20 h-full flex items-end justify-start text-left">
        <div className="p-8 md:p-16 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-normal text-white leading-[1.1]">
            {title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl font-light">
            {description}
          </p>
          <ModernAnimatedButton href={ctaHref} className="mt-10" variant="accent">
            {ctaLabel}
          </ModernAnimatedButton>
        </div>
      </div>
    </section>
  );
}
