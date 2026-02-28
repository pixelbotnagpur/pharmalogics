'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ModernAnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  href: string;
  variant?: 'default' | 'inverted' | 'accent';
}

export function ModernAnimatedButton({ children, className, href, variant = 'default' }: ModernAnimatedButtonProps) {
  const isDefault = variant === 'default';
  const isAccent = variant === 'accent';
  const isInverted = variant === 'inverted';

  return (
    <Link 
      href={href} 
      className={cn(
        "group/button inline-block cursor-pointer", 
        isDefault && 'text-primary',
        isAccent && 'text-accent',
        isInverted && 'text-secondary',
        className
      )}
    >
      <div className="flex items-center gap-px">
        {/* Text Container */}
        <div className={cn(
            "rounded-l-md px-3 py-2 transition-colors duration-300 flex items-center border",
            isDefault && "bg-primary group-hover/button:bg-primary/90 text-primary-foreground border-primary",
            isAccent && "bg-accent group-hover/button:bg-accent/90 text-accent-foreground border-accent",
            isInverted && "bg-secondary group-hover/button:bg-secondary/90 text-secondary-foreground border-secondary"
        )}>
          <span className="relative inline-block overflow-hidden h-5 leading-5 text-sm font-bold uppercase tracking-widest">
            <span className="block transition-transform duration-500 ease-out group-hover/button:-translate-y-full">
              {children}
            </span>
            <span className="absolute left-0 top-0 block translate-y-full transition-transform duration-500 ease-out group-hover/button:translate-y-0">
              {children}
            </span>
          </span>
        </div>
        
        {/* Icon Container */}
        <div className={cn(
            "rounded-r-md px-2 py-2 transition-colors duration-300 flex items-center border",
            isDefault && "bg-primary group-hover/button:bg-primary/90 text-primary-foreground border-primary",
            isAccent && "bg-accent group-hover/button:bg-accent/90 text-accent-foreground border-accent",
            isInverted && "bg-secondary group-hover/button:bg-secondary/90 text-secondary-foreground border-secondary"
        )}>
          <span className="relative inline-block overflow-hidden h-5 w-5">
            <ArrowUpRight className="absolute left-0 top-0 h-5 w-5 transition-transform duration-500 ease-out group-hover/button:-translate-y-full group-hover/button:translate-x-full" />
            <ArrowUpRight className="absolute left-0 top-0 h-5 w-5 translate-y-full -translate-x-full transition-transform duration-500 ease-out group-hover/button:translate-y-0 group-hover/button:translate-x-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
