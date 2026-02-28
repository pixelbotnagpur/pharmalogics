'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SciencePointProps {
  title: string;
  description: string;
}

export function SciencePoint({ title, description }: SciencePointProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Fade in as it enters, be fully visible in the middle, and fade out before it reaches the top.
  const opacity = useTransform(scrollYProgress, [0, 0.5, 0.6, 0.7], [0, 1, 1, 0]);

  return (
    <motion.div ref={ref} style={{ opacity }}>
      <h4 className="text-xl font-headline font-normal text-white">{title}</h4>
      <p className="mt-2 text-white/80 font-light">
        {description}
      </p>
    </motion.div>
  );
}
