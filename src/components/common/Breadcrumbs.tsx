'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex mb-6 w-full overflow-hidden", className)}
    >
      <ol className="flex items-center space-x-1 text-[10px] sm:text-xs text-muted-foreground font-light uppercase tracking-widest overflow-x-auto whitespace-nowrap py-1">
        <li className="flex items-center flex-shrink-0">
          <Link href="/" className="hover:text-primary transition-colors flex items-center">
            <Home className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center flex-shrink-0">
            <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0 opacity-50" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-normal truncate max-w-[120px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
