'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  X, 
  Zap, 
  TrendingUp, 
  Truck, 
  Crown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview A landscape Membership Enrollment Dialogue for first-time visitors.
 * Outlines clinical benefits and handles newsletter synchronization.
 */
export function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [agreed, setAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'why_exist_3');

  useEffect(() => {
    // Check persistence registry
    const hasSeen = localStorage.getItem('pharmlogics_membership_prompt');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('pharmlogics_membership_prompt', 'true');
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && agreed) {
      setIsSubmitted(true);
      localStorage.setItem('pharmlogics_membership_prompt', 'true');
      // Simulate registry synchronization
      setTimeout(() => setOpen(false), 3000);
    }
  };

  const benefits = [
    { icon: Zap, title: "15% Clinical Savings", desc: "Persistent discount on all protocols." },
    { icon: Truck, title: "Priority Fulfillment", desc: "Complimentary shipping on every node." },
    { icon: TrendingUp, title: "AI Health Tracking", desc: "Access to predictive biomarker logs." }
  ];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl bg-card border-none shadow-2xl rounded-3xl p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          
          {/* Visual/Benefits Column */}
          <div className="md:w-1/2 bg-primary relative p-8 md:p-12 flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">Tier One Membership</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-headline font-normal text-white leading-tight">
                  Optimize your <br /> biological edge.
                </h2>
                <p className="text-white/70 font-light text-sm leading-relaxed max-w-xs">
                  Establish your membership in the Pharmlogics community to unlock the full potential of your wellness journey.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">{benefit.title}</p>
                      <p className="text-[10px] text-white/50 font-light mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
              {heroImage && (
                <Image src={heroImage.imageUrl} alt="Background" fill className="object-cover" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent z-0" />
            
            <div className="relative z-10 mt-12 flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Verified Registry Access</span>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-card">
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 h-10 w-10 rounded-full bg-muted/30 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-headline font-normal">Apply for Access.</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-light text-sm">
                      Enroll in our membership registry to receive <span className="text-primary font-bold">10% OFF</span> your first acquisition protocol.
                    </DialogDescription>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="membership-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Registry Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input 
                          id="membership-email" 
                          type="email" 
                          placeholder="staff@pharmlogics.dev" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-14 pl-12 border-none bg-muted/20 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-base"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 bg-muted/5 p-4 rounded-xl border border-border/10">
                      <Checkbox 
                        id="newsletter-accept" 
                        checked={agreed}
                        onCheckedChange={(val) => setAccepted(!!val)}
                        className="mt-1 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded-none" 
                      />
                      <Label htmlFor="newsletter-accept" className="text-[10px] text-muted-foreground font-light leading-relaxed cursor-pointer select-none">
                        I authorize Pharmlogics to synchronize my digital node with clinical updates, formula launches, and membership protocols.
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!email || !agreed}
                      className="w-full h-16 rounded-xl uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] bg-primary text-white"
                    >
                      INITIALIZE ENROLLMENT <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <p className="text-center text-[9px] text-muted-foreground font-light italic">
                    By enrolling, you agree to our Clinical Governance Standards.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-12"
                >
                  <div className="h-20 w-20 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-headline">Registry Synchronized.</h3>
                    <p className="text-sm text-muted-foreground font-light max-w-[260px] mx-auto">
                      Welcome to Tier One. Use protocol <span className="text-primary font-bold">MEMBER10</span> at checkout for your introductory benefit.
                    </p>
                  </div>
                  <Button variant="ghost" onClick={handleClose} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
                    Enter Dashboard →
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
