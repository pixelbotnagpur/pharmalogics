'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, User, Loader2, Smartphone, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useFirestore, initiatePhoneSignIn } from '@/firebase';
import { createUserWithEmailAndPassword, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type SignUpStep = 'details' | 'otp' | 'address';

export function SignUpForm({ redirectPath = '/products' }: { redirectPath?: string }) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState<SignUpStep>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    zip: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Enforce E.164 format for Firebase
      const phone = formData.phone.trim().replace(/\s/g, '');
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // 1. Create the Auth User
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Initialize ReCAPTCHA for Phone verification
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      
      const result = await initiatePhoneSignIn(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      
      toast({ title: "Account Initialized", description: "Verifying your mobile node..." });
      setStep('otp');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    
    try {
      await confirmationResult.confirm(otp);
      toast({ title: "Identity Verified", description: "Mobile node established. Finalizing logistics..." });
      setStep('address');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The verification code is incorrect." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No active clinical session.");

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        shippingAddressLine1: formData.address,
        shippingCity: formData.city,
        shippingPostalCode: formData.zip,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({ title: "Profile Synchronized", description: "Your clinical journey has been registered." });
      router.push(redirectPath);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registry Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div id="recaptcha-container"></div>
      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">STEP 01 / 03</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Create Account.</h1>
              <p className="text-muted-foreground font-light text-base mx-auto max-w-md">
                Establish your clinical identity to begin biological optimization.
              </p>
            </div>
            
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input id="firstName" placeholder="Jane" value={formData.firstName} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input id="email" type="email" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mobile Node (+1...)</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input id="password" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                </div>
              </div>

              <div className="flex items-start justify-center space-x-3 pt-2">
                <Checkbox id="marketing" className="mt-1 border-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded-none" />
                <Label htmlFor="marketing" className="text-[10px] text-muted-foreground font-light text-center leading-relaxed cursor-pointer max-w-xs">
                  I agree to receive clinical updates and early access to new formula launches. 
                  View our <Link href="/privacy-policy" className="underline text-foreground">Privacy Policy</Link>.
                </Label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-16 text-xs font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'REQUEST ACCESS'} 
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-dashed border-border/50">
              <p className="text-xs text-muted-foreground font-light">
                Already optimized? <Link href="/login" className="text-primary font-bold hover:underline">Sign in here</Link>
              </p>
            </div>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">STEP 02 / 03</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Verify Node.</h1>
              <p className="text-muted-foreground font-light text-base">
                An encryption code has been sent to <span className="text-foreground font-medium">{formData.phone}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification Code</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="otp" 
                    placeholder="000000" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="h-16 pl-12 border-foreground/40 rounded-sm bg-transparent tracking-[0.5em] text-2xl font-bold" 
                    maxLength={6}
                    autoFocus 
                    required 
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-16 text-xs font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'VERIFY MOBILE NODE'}
                {!isLoading && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>

              <button 
                type="button" 
                onClick={() => setStep('details')}
                className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors text-center"
              >
                ← BACK TO DETAILS
              </button>
            </form>
          </motion.div>
        )}

        {step === 'address' && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">STEP 03 / 03</p>
              <h1 className="text-4xl md:text-5xl font-headline font-normal leading-none">Logistics Registry.</h1>
              <p className="text-muted-foreground font-light text-base">
                Provide your primary delivery node for formula fulfillment.
              </p>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input id="address" placeholder="123 Clinical Way" value={formData.address} onChange={handleInputChange} className="h-11 pl-12 border-foreground/40 rounded-sm bg-transparent" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</Label>
                  <Input id="city" placeholder="Miami" value={formData.city} onChange={handleInputChange} className="h-11 border-foreground/40 rounded-sm bg-transparent" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="zip" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zip Code</Label>
                  <Input id="zip" placeholder="33101" value={formData.zip} onChange={handleInputChange} className="h-11 border-foreground/40 rounded-sm bg-transparent" required />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-16 text-xs font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 rounded-sm group transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'COMPLETE REGISTRATION'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
