
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function PromoVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.video
        style={{ y }}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />
    </div>
  );
}
