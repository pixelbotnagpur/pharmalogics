
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronRight,
  ShieldCheck,
  Activity,
  Microscope,
  Brain,
  Zap,
  BookOpen
} from 'lucide-react';

interface BlogCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

const CAT_ICONS: Record<string, any> = {
  'RESEARCH': Microscope,
  'CLINICAL': Activity,
  'OPTIMIZATION': Zap,
  'All': BookOpen
};

const CAT_DESCS: Record<string, string> = {
  'RESEARCH': 'Laboratory abstracts & molecular data.',
  'CLINICAL': 'Evidence-based protocol verification.',
  'OPTIMIZATION': 'Biological edge & cellular efficiency.',
  'All': 'Complete research registry.'
};

export function BlogCategorySheet({ isOpen, onClose, categories, activeCategory, onSelect }: BlogCategorySheetProps) {
  const displayCats = ['All', ...categories];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "z-[70] bg-background border-none shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85vh]",
              "fixed top-16 right-0 left-0 md:left-auto md:right-4 w-full md:w-[340px] rounded-b-xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-8 bg-white border-b text-left">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">RESEARCH FILTER</p>
                <h3 className="font-headline text-2xl leading-tight">Protocol Registry</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Classified Clinical Data</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1 bg-background overflow-y-auto" data-lenis-prevent>
              {displayCats.map((cat) => {
                const isActive = (cat === 'All' && !activeCategory) || (cat === activeCategory);
                const Icon = CAT_ICONS[cat] || BookOpen;
                const desc = CAT_DESCS[cat] || 'Clinical research abstracts.';

                return (
                  <button 
                    key={cat} 
                    onClick={() => {
                      onSelect(cat === 'All' ? null : cat);
                      onClose();
                    }}
                    className={cn(
                      "w-full group flex items-center gap-4 p-4 rounded-xl transition-all border border-transparent text-left",
                      isActive ? "bg-primary text-white shadow-lg" : "hover:bg-white hover:border-border/20"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500",
                      isActive ? "bg-white/10 text-white" : "bg-muted/30 text-primary"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cat}</p>
                      <p className={cn(
                        "text-[10px] uppercase tracking-widest font-light truncate",
                        isActive ? "text-white/60" : "text-muted-foreground"
                      )}>
                        {desc}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all shrink-0",
                      isActive ? "text-white opacity-100" : "text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-primary"
                    )} />
                  </button>
                );
              })}
            </div>

            <div className="p-6 bg-muted/10 border-t border-border shrink-0">
              <p className="text-[9px] text-muted-foreground font-light leading-relaxed italic">
                *Select a classification node to synchronize your research grid with specific laboratory data.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
