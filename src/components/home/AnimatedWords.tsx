'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedWordsProps {
  text: string;
  className?: string;
}

export function AnimatedWords({ text, className }: AnimatedWordsProps) {
  const container = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start 60%', 'start -5%'],
  });

  const words = text.split(' ');

  return (
    <p ref={container} className={cn('flex flex-wrap', className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        
        return (
          <Word 
            key={i} 
            progress={scrollYProgress} 
            range={[start, end]}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

interface WordProps {
  children: string;
  progress: any;
  range: [number, number];
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <span className='relative mr-3 mt-3'>
      <span className="absolute opacity-10">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}
