'use client';

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  codOtp: string;
  setCodOtp: (val: string) => void;
  onConfirm: () => void;
  isOtpLoading: boolean;
  billingError: boolean;
  onCancel: () => void;
}

export function VerificationDialog({
  open,
  onOpenChange,
  phoneNumber,
  codOtp,
  setCodOtp,
  onConfirm,
  isOtpLoading,
  billingError,
  onCancel
}: VerificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-primary text-white">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="h-5 w-5" />
            <DialogTitle className="font-headline text-xl">Mobile Verification</DialogTitle>
          </div>
          <DialogDescription className="text-white/70 font-light">
            Cash on Delivery protocols require a verified identity handshake for number <span className="text-white font-medium">{phoneNumber}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          {billingError ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">Logistical Node Inactive</p>
                  <p className="text-sm font-light">Firebase SMS services are not active. Simulate verification for this prototype.</p>
                </div>
              </div>
              <Button disabled={isOtpLoading} onClick={onConfirm} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl">
                {isOtpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Simulate Verified Identity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Verification Code</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    placeholder="000000" 
                    value={codOtp} 
                    onChange={(e) => setCodOtp(e.target.value)} 
                    className="h-16 pl-12 border-foreground/20 rounded-sm bg-muted/10 tracking-[0.5em] text-2xl font-bold text-center" 
                    maxLength={6} 
                    autoFocus 
                    required 
                  />
                </div>
              </div>
              <Button onClick={onConfirm} disabled={isOtpLoading || codOtp.length < 6} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl">
                {isOtpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Verify & Complete Order
              </Button>
            </div>
          )}
          <button onClick={onCancel} className="w-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Cancel Acquisition
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
