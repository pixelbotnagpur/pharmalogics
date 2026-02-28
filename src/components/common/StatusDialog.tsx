'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info } from "lucide-react";

/**
 * @fileOverview A high-integrity status dialogue for Pharmlogics.
 * Replaces success toasts for significant clinical and administrative events.
 */
export function StatusDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  type = 'success' 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  title: string; 
  description: string; 
  type?: 'success' | 'info';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-8 bg-primary text-white">
          <div className="flex items-center gap-3 mb-2">
            {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            <DialogTitle className="font-headline text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-white/70 font-light">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="p-8">
          <Button onClick={() => onOpenChange(false)} className="w-full h-12 uppercase text-[10px] font-bold tracking-widest bg-primary text-white hover:bg-primary/90 border-none">
            Acknowledge Protocol
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
