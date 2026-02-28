
'use client';

import { CreditCard, Banknote, Zap, Check, Landmark, Wallet, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FinancialProtocolProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export function FinancialProtocol({ paymentMethod, setPaymentMethod }: FinancialProtocolProps) {
  return (
    <section className="space-y-8">
      <h2 className="text-xl font-headline font-normal flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        Financial Protocol
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital Payment Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentMethod('digital')}
          className={cn(
            "relative aspect-[1.6/1] w-full rounded-2xl p-6 cursor-pointer transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between bg-primary",
            paymentMethod === 'digital' 
              ? "ring-4 ring-primary ring-offset-4" 
              : ""
          )}
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="h-10 w-12 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Zap className={cn("h-6 w-6", paymentMethod === 'digital' ? "text-accent" : "text-white/60")} />
            </div>
            {paymentMethod === 'digital' && (
              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white shadow-lg">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="relative z-10">
            <p className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", paymentMethod === 'digital' ? "text-white/60" : "text-white/40")}>
              Secured Protocol
            </p>
            <h3 className="text-xl font-headline mt-1 text-white">
              Digital Payment
            </h3>
            <div className="flex gap-2 mt-4 opacity-60 text-white">
              <CreditCard className="h-4 w-4" />
              <Landmark className="h-4 w-4" />
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">Handshake Node 01</span>
          </div>
        </motion.div>

        {/* Cash on Delivery Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentMethod('cod')}
          className={cn(
            "relative aspect-[1.6/1] w-full rounded-2xl p-6 cursor-pointer transition-all duration-500 overflow-hidden shadow-xl flex flex-col justify-between border-2",
            paymentMethod === 'cod' 
              ? "bg-card border-primary ring-4 ring-primary ring-offset-4 shadow-primary/5" 
              : "bg-card border-border"
          )}
        >
          <div className="flex justify-between items-start relative z-10">
            <div className={cn(
              "h-10 w-12 rounded-md flex items-center justify-center",
              paymentMethod === 'cod' ? "bg-accent/10 border border-accent/20" : "bg-muted/50 border border-border/20"
            )}>
              <Banknote className={cn("h-6 w-6", paymentMethod === 'cod' ? "text-accent" : "text-muted-foreground")} />
            </div>
            {paymentMethod === 'cod' && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="relative z-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Logistics Protocol
            </p>
            <h3 className="text-xl font-headline mt-1 text-foreground">
              Cash on Delivery
            </h3>
            <p className="text-[10px] text-muted-foreground font-light mt-2 uppercase tracking-widest">Verification at Node</p>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-6 opacity-30">
            <Truck className="h-12 w-12 text-primary" strokeWidth={1} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
