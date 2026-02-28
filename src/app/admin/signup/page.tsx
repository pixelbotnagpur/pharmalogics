'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Lock, ArrowRight, Mail, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth, initiateEmailSignUp, useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

export default function AdminSignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Reactive redirect when account is created and signed in
  useEffect(() => {
    if (user) {
      toast({ 
        title: "Node Registration Active", 
        description: "Your identity is established. Super Admin approval required for role elevation." 
      });
      router.push('/admin/login');
    }
  }, [user, router, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Non-blocking call - listener handles the next steps
      initiateEmailSignUp(auth, formData.email, formData.password);
      toast({ title: "Enrollment Protocol Initialized", description: "Provisioning clinical identity node..." });
    } catch (err: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: err.message || "Could not established clinical identity.",
      });
    }
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
            <Badge variant="outline" className="border-border text-muted-foreground text-[8px] uppercase tracking-widest px-4 py-1">REGISTRATION NODE</Badge>
          </div>

          <Card className="border-none shadow-2xl bg-card rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary text-white pb-8">
              <CardTitle className="text-xl font-headline font-normal text-center">Staff Enrollment</CardTitle>
              <CardDescription className="text-white/70 font-light text-center">Establish your clinical identity within the infrastructure registry.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleInputChange} className="h-11 border-foreground/20 rounded-md" required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleInputChange} className="h-11 border-foreground/20 rounded-md" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="staff@pharmlogics.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-11 pl-12 border-foreground/20 rounded-md" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Minimum 8 characters" 
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-11 pl-12 border-foreground/40 rounded-md" 
                      required 
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 text-[11px] font-bold tracking-[0.2em] uppercase rounded-md shadow-lg bg-secondary hover:bg-secondary/90 text-white transition-all group">
                  {isLoading ? (
                    <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> PROCESSING...</span>
                  ) : (
                    <span className="flex items-center">ENROLL IDENTITY <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="mt-8 text-[9px] text-center text-muted-foreground uppercase tracking-[0.2em] font-light italic">
            Registration establishes an identity node. Role activation is subject to clinical review.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
