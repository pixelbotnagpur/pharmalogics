'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ModernAnimatedButton } from '@/components/ui/ModernAnimatedButton';

interface SectionHeaderProps {
  index: string;
  title: string;
  description?: string;
  refId?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  variant?: 'default' | 'inverted';
}

/**
 * @fileOverview A high-integrity, technical section header component.
 * Features modular indexing (MOD.XX), registry lines, and anchored reference IDs.
 */
export function SectionHeader({
  index,
  title,
  description,
  refId = 'REF.PL.PROTOCOL.24',
  ctaLabel,
  ctaHref,
  className,
  variant = 'default'
}: SectionHeaderProps) {
  const isInverted = variant === 'inverted';
  const hasSecondRow = !!(description || (ctaHref && ctaLabel));

  return (
    <div className={cn("w-full mb-12 md:mb-20", className)}>
      {/* Top Protocol Row */}
      <div className={cn(
        "flex items-center gap-4",
        hasSecondRow && "mb-10"
      )}>
        {/* Left Section Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse",
            isInverted ? "bg-accent" : "bg-primary"
          )} />
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-bold font-mono uppercase tracking-widest",
              isInverted ? "text-white/80" : "text-primary/80"
            )}>
              MOD.{index}
            </span>
            <h2 className={cn(
              "text-[10px] font-bold uppercase tracking-[0.4em]",
              isInverted ? "text-white" : "text-foreground"
            )}>
              {title}
            </h2>
          </div>
        </div>
        
        {/* Registry Line - Flexible spacer between identity and reference */}
        <div className={cn(
          "h-px flex-1",
          isInverted ? "bg-white/40" : "bg-border/80"
        )} />

        {/* Right Reference Identity */}
        <span className={cn(
          "shrink-0 text-[8px] font-mono font-bold uppercase tracking-widest opacity-80 ml-4",
          isInverted ? "text-white" : "text-muted-foreground"
        )}>
          {refId}
        </span>
      </div>

      {/* Description & Action Row */}
      {hasSecondRow && (
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {description && (
            <p className={cn(
              "text-xl md:text-3xl font-headline font-normal max-w-3xl leading-[1.2]",
              isInverted ? "text-white" : "text-foreground"
            )}>
              {description}
            </p>
          )}
          {ctaHref && ctaLabel && (
            <div className="shrink-0 pt-2">
              <ModernAnimatedButton 
                href={ctaHref} 
                variant={isInverted ? 'inverted' : 'accent'}
              >
                {ctaLabel}
              </ModernAnimatedButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
