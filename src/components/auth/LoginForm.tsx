'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  User, 
  Loader2,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAuth, 
  initiateEmailSignIn, 
  initiateGoogleSignIn,
  initiatePhoneSignIn
} from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

type LoginStep = 'identifier' | 'password' | 'otp';

export function LoginForm() {
  const auth = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<LoginStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const isEmail = (val: string) => val.includes('@');
  const isPhone = (val: string) => /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, ''));

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    
    if (isEmail(val)) {
      setStep('password');
    } else if (isPhone(val)) {
      setIsLoading(true);
      try {
        // Enforce E.164 format for Firebase
        const sanitizedPhone = val.replace(/\s/g, '');
        const formattedPhone = sanitizedPhone.startsWith('+') ? sanitizedPhone : `+${sanitizedPhone}`;
        
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
        
        const result = await initiatePhoneSignIn(auth, formattedPhone, verifier);
        setConfirmationResult(result);
        setStep('otp');
        toast({ title: "OTP Dispatched", description: "A verification code has been sent to your device." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Phone Auth Error", description: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({ variant: "destructive", title: "Input Error", description: "Please enter a valid email or mobile number (+1...)." });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    initiateEmailSignIn(auth, identifier, password)
      .catch((err: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The clinical credentials provided are invalid.",
        });
      });

    toast({ title: "Synchronizing Identity", description: "Accessing clinical profile..." });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({ title: "Device Verified", description: "Session established via mobile node." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "The verification code is incorrect." });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    initiateGoogleSignIn(auth).catch(() => {
      // Errors are handled by the global emitter
    });
    toast({ title: "Social Sync", description: "Connecting via Google ID..." });
  };

  return (
    <div className="w-full max-w-md">
      <div id="recaptcha-container"></div>
      <AnimatePresence mode="wait">
        {step === 'identifier' && (
          <motion.div
            key="identifier"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">ACCESS PORTAL</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Welcome back.</h1>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Enter your email or mobile number to access your optimization dashboard.
              </p>
            </div>
            
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email or Mobile</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="identifier" 
                    placeholder="Email or +1..." 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-11 pl-12 border-foreground/40 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/20 bg-transparent" 
                    required 
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-[11px] font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'CONTINUE'} 
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed border-border/50" /></div>
              <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.3em]"><span className="bg-card px-4 text-muted-foreground">OR</span></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full h-14 text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm border-foreground/20 hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.01h2.64c1.55-1.42 2.43-3.52 2.43-5.94z"
                  className="fill-[#4285F4] group-hover:fill-white transition-colors"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.01c-.73.48-1.67.76-2.64.76-2.85 0-5.27-1.92-6.13-4.51H2.18v2.09C3.99 20.24 7.71 23 12 23z"
                  className="fill-[#34A853] group-hover:fill-white transition-colors"
                />
                <path
                  d="M5.87 14.58c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V8.33H2.18C1.43 9.83 1 11.54 1 12.5s.43 3.33 1.18 4.83l3.69-2.75z"
                  className="fill-[#FBBC05] group-hover:fill-white transition-colors"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.71 1 3.99 3.76 2.18 7.42l3.69 2.75c.86-2.59 3.28-4.51 6.13-4.51z"
                  className="fill-[#EA4335] group-hover:fill-white transition-colors"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground font-light">
                Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Request Access</Link>
              </p>
            </div>
          </motion.div>
        )}

        {step === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">PASSWORD REQUIRED</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Security check.</h1>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Signing in as <span className="text-foreground font-medium">{identifier}</span>.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-12 border-foreground/40 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/20 bg-transparent" 
                    autoFocus
                    required 
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-[11px] font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'SIGN IN'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>

              <button 
                type="button"
                onClick={() => setStep('identifier')}
                className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors text-center"
              >
                ← CHANGE IDENTIFIER
              </button>
            </form>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">MOBILE VERIFICATION</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Enter Code.</h1>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                A verification code was sent to <span className="text-foreground font-medium">{identifier}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">6-Digit Code</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="otp" 
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 pl-12 border-foreground/40 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/20 bg-transparent tracking-[0.5em] text-xl font-bold" 
                    maxLength={6}
                    autoFocus
                    required 
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-[11px] font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'VERIFY DEVICE'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>

              <button 
                type="button"
                onClick={() => setStep('identifier')}
                className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors text-center"
              >
                ← CHANGE MOBILE NUMBER
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
