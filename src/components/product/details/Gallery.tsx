'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface GalleryProps {
  gallery: { imageUrl: string; imageHint: string }[];
  activeImage: { imageUrl: string; imageHint: string } | null;
  setActiveImage: (img: { imageUrl: string; imageHint: string }) => void;
  onMainImageClick?: () => void;
}

export function Gallery({ gallery, activeImage, setActiveImage, onMainImageClick }: GalleryProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateMousePosition = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      });
    }
    setIsHovering(true);
  };

  const scroll = (direction: 'up' | 'down') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientHeight / 5;
    scrollRef.current.scrollBy({
      top: direction === 'up' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
      <div className="grid grid-cols-6 gap-4">
        
        {/* Thumbnails Column */}
        <div className="col-span-1 relative">
          <div className="absolute inset-0 flex flex-col group/thumbnails">
            {gallery.length > 5 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); scroll('up'); }}
                  className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm py-1 transition-all hover:bg-background opacity-0 group-hover/thumbnails:opacity-100 border-b border-border/10"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); scroll('down'); }}
                  className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm py-1 transition-all hover:bg-background opacity-0 group-hover/thumbnails:opacity-100 border-t border-border/10"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </>
            )}

            <div 
              ref={scrollRef}
              className="flex flex-col gap-2 overflow-y-auto no-scrollbar snap-y snap-mandatory h-full"
              style={{ scrollbarWidth: 'none' }}
            >
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative aspect-square w-full flex-shrink-0 rounded-md overflow-hidden border-2 transition-all snap-start",
                    activeImage?.imageUrl === img.imageUrl ? "border-primary" : "border-transparent hover:border-primary/30"
                  )}
                  style={{ height: 'calc(20% - 6.4px)' }}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.imageHint}
                    fill
                    className="object-cover"
                    sizes="10vw"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="col-span-5 relative">
          {activeImage && (
            <div 
              ref={containerRef}
              className="relative aspect-square w-full rounded-xl overflow-hidden cursor-none"
              onClick={onMainImageClick}
              onMouseMove={updateMousePosition}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Image
                src={activeImage.imageUrl}
                alt={activeImage.imageHint}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 80vw, 50vw"
                priority
              />

              <AnimatePresence>
                {isHovering && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, x: mousePos.x, y: mousePos.y }}
                    animate={{ scale: 1, opacity: 1, x: mousePos.x, y: mousePos.y }}
                    exit={{ scale: 0, opacity: 0, x: mousePos.x, y: mousePos.y }}
                    transition={{ 
                      type: 'spring', 
                      damping: 35, 
                      stiffness: 450, 
                      mass: 0.3,
                      x: { type: 'spring', stiffness: 500, damping: 40 },
                      y: { type: 'spring', stiffness: 500, damping: 40 }
                    }}
                    className="pointer-events-none absolute left-0 top-0 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[11px] font-bold tracking-[0.15em] text-primary-foreground shadow-2xl"
                  >
                    <span>ZOOM+</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}