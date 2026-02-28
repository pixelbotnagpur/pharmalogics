'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Lock, ArrowRight, RefreshCw, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth, initiateEmailSignIn, useUser } from '@/firebase';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Reactive redirect when auth state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('pharmlogics_admin_auth', 'true');
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (captchaInput !== captcha) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The 4-digit captcha code is incorrect.",
      });
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setIsLoading(true);
    
    initiateEmailSignIn(auth, email, password)
      .catch((err: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The clinical credentials provided are invalid.",
        });
        generateCaptcha();
        setCaptchaInput('');
      });

    toast({ title: "Verification Protocol Initiated", description: "Establishing clinical secure link..." });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Governing Registry Access</p>
          </div>

          <Card className="border-none shadow-2xl bg-card rounded-xl overflow-hidden">
            <CardHeader className="bg-primary text-white pb-8">
              <CardTitle className="text-xl font-headline font-normal text-center">Security Verification</CardTitle>
              <CardDescription className="text-white/70 font-light text-center">Enter administrative credentials to access the clinical registry.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Email</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="admin-email" 
                      type="email"
                      placeholder="e.g. admin@pharmlogics.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-12 border-foreground/20 rounded-md focus-visible:ring-1 focus-visible:ring-primary/20" 
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-12 border-foreground/20 rounded-md focus-visible:ring-1 focus-visible:ring-primary/20" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Human Verification</Label>
                    <button 
                      type="button" 
                      onClick={generateCaptcha}
                      className="text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" /> Refresh Code
                    </button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 bg-muted h-11 flex items-center justify-center rounded-md font-mono text-xl font-bold tracking-[0.4em] select-none border border-dashed border-foreground/20 text-primary italic">
                      {captcha || '....'}
                    </div>
                    <Input 
                      placeholder="Code" 
                      className="flex-1 h-11 border-foreground/20 rounded-md focus-visible:ring-1 focus-visible:ring-primary/20 text-center font-mono"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 text-[11px] font-bold tracking-[0.2em] uppercase rounded-md shadow-lg hover:shadow-primary/20 transition-all group">
                  {isLoading ? (
                    <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> VERIFYING...</span>
                  ) : (
                    <span className="flex items-center">AUTHORIZE ACCESS <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="mt-8 text-[9px] text-center text-muted-foreground uppercase tracking-[0.2em] font-light italic">
            Authorized personnel only. All access is logged and encrypted via end-to-end nodes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
