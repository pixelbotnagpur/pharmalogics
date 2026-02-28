
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  name: string;
  description: string;
  stock?: number;
  flavor?: string;
}

export function Header({ name, description, stock = 0, flavor }: HeaderProps) {
  const isInStock = stock > 0;

  return (
    <div className="space-y-2">
      <Badge variant="secondary" className="uppercase tracking-widest">{flavor || 'Original'}</Badge>
      <h1 className="text-4xl md:text-5xl font-headline font-normal">{name}+</h1>
      <p className="font-light uppercase tracking-widest">STRENGTHEN, DEFEND, THRIVE</p>
      
      {/* Stock Status Indicator */}
      <div className="flex items-center gap-2 pt-2 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </span>
        {isInStock && (
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>

      <p className="mt-2 text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">U.S. Patent Pending.</p>
    </div>
  );
}
