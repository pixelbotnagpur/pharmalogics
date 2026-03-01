'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SciencePointProps {
  title: string;
  description: string;
  index?: number;
  icon?: LucideIcon;
}

/**
 * @fileOverview SciencePoint component for the Clinical Registry.
 * Optimized with solid white background and high-visibility separators.
 */
export function SciencePoint({ title, description, index = 0, icon: Icon }: SciencePointProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className={cn(
        "relative p-8 md:p-10 rounded-3xl border transition-all duration-500 shadow-none",
        "bg-white border-white/50 hover:border-primary/40"
      )}>
        {/* Interaction Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              {Icon ? <Icon className="h-6 w-6" strokeWidth={1.5} /> : <span className="font-mono text-lg">0{index + 1}</span>}
            </div>
            <div className="h-px w-8 bg-white/40 hidden sm:block" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/40">
              PROTOCOL_NODE.{(index + 1).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-2 w-2 rounded-full bg-accent/40 animate-pulse" />
        </div>

        {/* Content Node */}
        <h4 className="text-2xl md:text-3xl font-headline font-normal text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-muted-foreground font-light text-sm md:text-base leading-relaxed max-w-xl">
          {description}
        </p>

        {/* Aesthetic Detail: High-Visibility Technical Line */}
        <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:via-accent/40 transition-all duration-700" />
      </div>

      {/* Connection Node (Dot on the side) */}
      <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.5 }}
            whileInView={{ scale: 1 }}
            className="h-1 w-1 rounded-full bg-accent" 
          />
        </div>
      </div>
    </motion.div>
  );
}
