
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Search,
  LayoutGrid,
  Pause,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function Lightbox({
  images,
  open,
  onOpenChange,
  startIndex = 0,
  title,
  className,
  dataAiHint,
  altPrefix,
}: {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
  title: string;
  className?: string;
  dataAiHint?: string;
  altPrefix: string;
}) {
  const [[currentImageIndex, direction], setCurrentImageIndexState] = useState([startIndex, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const setCurrentImageIndex = (index: number) => {
    setCurrentImageIndexState((prev) => {
      const newDirection = index > prev[0] ? 1 : -1;
      return [index, newDirection];
    });
  };

  const paginate = (newDirection: number) => {
    if (images.length === 0) return;
    const newIndex = (currentImageIndex + newDirection + images.length) % images.length;
    setCurrentImageIndexState([newIndex, newDirection]);
  };

  const nextImage = useCallback(() => paginate(1), [currentImageIndex, images.length]);
  const prevImage = useCallback(() => paginate(-1), [currentImageIndex, images.length]);

  useEffect(() => {
    if (open) {
      setCurrentImageIndexState([startIndex, 0]);
      setIsPlaying(false);
      setIsZoomed(false);
    }
  }, [open, startIndex]);

  useEffect(() => {
    if (open && showThumbnails && thumbnailContainerRef.current) {
      const activeThumbnail = thumbnailContainerRef.current.children[currentImageIndex] as HTMLElement;
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentImageIndex, open, showThumbnails]);

  useEffect(() => {
    let slideInterval: NodeJS.Timeout;
    if (isPlaying && open) {
      slideInterval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    return () => {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    };
  }, [isPlaying, open, nextImage]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleThumbnails = () => setShowThumbnails(!showThumbnails);
  const handleZoom = () => setIsZoomed((prev) => !prev);

  const handleFullscreen = () => {
    const elem = document.querySelector(`.${className}`);
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
        setIsPlaying(false);
        setIsZoomed(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={cn('w-screen h-screen max-w-full p-0 bg-background border-none grid grid-rows-[auto_1fr_auto]', className)}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-4 h-16 border-b z-10">
          <span className="text-sm text-muted-foreground">
            {images.length > 0 ? currentImageIndex + 1 : 0} / {images.length}
          </span>
          <div className="flex items-center gap-0 sm:gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Zoom in" onClick={handleZoom}><Search className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'} onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" aria-label="Toggle fullscreen" onClick={handleFullscreen}><Maximize className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" aria-label="Toggle thumbnails" onClick={toggleThumbnails}><LayoutGrid className="h-4 w-4" /></Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close lightbox">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 p-4 md:p-8"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {images[currentImageIndex] && (
                <Image
                  src={images[currentImageIndex]}
                  alt={`${altPrefix} ${currentImageIndex + 1}`}
                  fill
                  className={cn("object-contain transition-transform duration-300", isZoomed && "scale-125 cursor-zoom-out")}
                  priority
                  data-ai-hint={dataAiHint}
                  onClick={() => isZoomed && setIsZoomed(false)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={prevImage} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-foreground" aria-label="Previous image">
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextImage} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-foreground" aria-label="Next image">
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {showThumbnails && images.length > 1 && (
          <div className="w-full h-20 sm:h-32 px-4 border-t">
            <div ref={thumbnailContainerRef} className="h-full w-full flex items-center gap-2 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={img}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative h-16 sm:h-24 aspect-video shrink-0 overflow-hidden outline-none ring-offset-2 ring-primary focus-visible:ring-2",
                    currentImageIndex === index && "ring-2"
                  )}
                >
                  <Image src={img} alt={`Thumbnail for ${altPrefix} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
