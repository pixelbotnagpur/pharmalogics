'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useUser, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Phone,
  RefreshCw,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatusDialog } from '@/components/common/StatusDialog';
import type { UserProfile } from '@/lib/types';

export default function AdminProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', desc: '' });

  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    shippingAddressLine1: '',
    shippingCity: '',
    shippingStateProvince: '',
    shippingPostalCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        shippingAddressLine1: profile.shippingAddressLine1 || '',
        shippingCity: profile.shippingCity || '',
        shippingStateProvince: profile.shippingStateProvince || '',
        shippingPostalCode: profile.shippingPostalCode || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSave = () => {
    if (!userRef) return;
    setIsSaving(true);
    
    updateDocumentNonBlocking(userRef, {
      ...formData,
      updatedAt: new Date().toISOString()
    });
    
    setTimeout(() => {
      setIsSaving(false);
      setStatusDialog({
        open: true,
        title: "Registry Updated",
        desc: "Your clinical administrative node identifiers have been synchronized with the cloud registry."
      });
    }, 500);
  };

  const handlePasswordReset = async () => {
    const email = user?.email || auth.currentUser?.email;
    if (!email) {
      toast({ 
        variant: "destructive", 
        title: "Identity Error", 
        description: "Could not resolve a clinical email for the reset protocol." 
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusDialog({
        open: true,
        title: "Protocol Initialized",
        desc: `A secure security key reset link has been dispatched to ${email}. Follow the instructions to replace your access node.`
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Security Error", description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border/30">
        <h1 className="text-3xl font-headline font-normal text-primary">Admin Profile</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Personal Governance & Security Registry</p>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
          {[
            { value: 'identity', icon: User, label: 'Identity Node' },
            { value: 'security', icon: Lock, label: 'Security & Keys' },
          ].map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <tab.icon className="h-3 w-3 mr-2" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="identity" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Personal Identifiers
                  </CardTitle>
                  <CardDescription className="text-xs">Update your administrative profile data used in the clinical registry.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                      <Input id="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                      <Input id="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Email (Primary Identifier)</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input value={user?.email || ''} readOnly className="h-12 pl-12 bg-muted/10 border-none opacity-60 font-mono text-xs" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Mobile Node</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input id="phoneNumber" placeholder="+1 (555) 000-0000" value={formData.phoneNumber || ''} onChange={handleInputChange} className="h-12 pl-12 bg-muted/20 border-none" />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 mt-4 bg-primary text-white hover:bg-primary/90 border-none">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Synchronize Profile Node
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="bg-primary text-white border-none rounded-xl shadow-2xl relative overflow-hidden h-full">
                <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
                  <div className="space-y-6">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="text-3xl font-headline leading-tight">Identity <br /> Integrity.</h3>
                    <p className="text-sm text-white/70 font-light leading-relaxed">
                      Your administrative node is a vital part of the Pharmlogics governing layer. Maintain accurate data to ensure laboratory audit traceability.
                    </p>
                  </div>
                  <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 py-3 border-t border-white/10">
                      <Activity className="h-4 w-4 text-white/40" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Node ID: {user?.uid.slice(0, 12)}...</span>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden max-w-2xl">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Lock className="h-4 w-4" /> Biological Security Keys
              </CardTitle>
              <CardDescription className="text-xs">Manage your authentication credentials and access protocols.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="p-6 bg-accent/5 border border-accent/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Password Protocol</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  To ensure maximum integrity, password changes are handled via a secure clinical reset link. Triggering this protocol will log you out of all active administrative sessions.
                </p>
                <Button 
                  onClick={handlePasswordReset} 
                  disabled={isResetting} 
                  variant="accent" 
                  className="h-12 px-8 uppercase text-[10px] font-bold tracking-widest group border-none"
                >
                  {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Trigger Security Reset Node
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="space-y-4 opacity-40 grayscale pointer-events-none">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Future Protocols</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light">Multi-Factor Authentication (MFA)</span>
                  <Badge variant="outline" className="text-[8px]">DEVELOPMENT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light">Biometric Laboratory Access</span>
                  <Badge variant="outline" className="text-[8px]">QUEUED</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StatusDialog 
        open={statusDialog.open} 
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.title}
        description={statusDialog.desc}
      />
    </div>
  );
}
