'use client';

import { cn } from '@/lib/utils';
import { PackOption } from '@/lib/types';

interface PackSelectionProps {
  packs: PackOption[];
  selectedPack: PackOption | null;
  onSelectPack: (pack: PackOption) => void;
}

export function PackSelection({ packs, selectedPack, onSelectPack }: PackSelectionProps) {
  return (
    <div>
      <h3 className="font-light text-sm uppercase tracking-wider text-muted-foreground mb-2">Select Pack Size</h3>
      <div className="grid grid-cols-3 gap-2">
        {packs.map((pack) => (
          <button
            key={pack.label}
            onClick={() => onSelectPack(pack)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg border-2 transition-all",
              selectedPack?.label === pack.label 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="font-headline text-lg">{pack.label}</span>
            {pack.discountMultiplier < 1 && (
              <span className="text-[10px] text-accent font-bold uppercase mt-1">
                Save {Math.round((1 - pack.discountMultiplier) * 100)}%
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
