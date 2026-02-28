'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useState } from 'react';

/**
 * @fileOverview A fixed vertical navigation element for the Formula Finder.
 * This provides a persistent entry point for the clinical optimization quiz.
 * It features a discreet icon-only state that expands on hover.
 */
export function FixedFormulaFinder() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        href="/formula-finder"
        className="flex flex-col items-center bg-primary text-white rounded-l-lg shadow-2xl hover:bg-accent transition-all group border border-white/10 border-r-0 overflow-hidden"
      >
        {/* Icon Container - Always Visible */}
        <div className="h-10 w-10 flex items-center justify-center shrink-0">
          <Brain className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        </div>
        
        {/* Label Container - Expands on Hover */}
        <motion.div 
          initial={false}
          animate={{ 
            height: isHovered ? 'auto' : 0, 
            opacity: isHovered ? 1 : 0,
            marginTop: isHovered ? 4 : 0,
            marginBottom: isHovered ? 20 : 0
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center whitespace-nowrap overflow-hidden"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] [writing-mode:vertical-lr] rotate-180">
            Formula Finder
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
