
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Camera, 
  Globe, 
  MapPin, 
  User as UserIcon,
  Phone,
  Mail,
  Loader2,
  Calendar,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, isLoading } = useDoc<UserProfile>(userRef);

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSave = () => {
    if (!userRef) return;
    setIsSaving(true);
    
    const updateData = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    updateDocumentNonBlocking(userRef, updateData);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Clinical Data Synchronized", description: "Your biological registry node has been updated." });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 pb-24"
    >
      <div className="pb-10 border-b border-border/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">USER CONFIGURATION</p>
        <h1 className="text-4xl md:text-5xl font-headline font-normal leading-tight">Bio-Registry.</h1>
        <p className="text-sm text-muted-foreground font-light mt-4 max-w-md leading-relaxed">
          Maintain your personal identifiers and logistical delivery nodes to ensure seamless protocol fulfillment.
        </p>
      </div>

      <div className="grid gap-16">
        {/* Personal Identity */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-headline font-normal">Personal Identity</h2>
                <p className="text-xs text-muted-foreground font-light">Enrolled since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Session'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/10">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">Verified Protocol Node</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="relative group">
                <div className="aspect-square rounded-3xl bg-muted/20 overflow-hidden border-2 border-background shadow-2xl relative">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/600/600`} className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <AvatarFallback className="text-4xl font-headline bg-primary text-white">
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                </div>
                <button className="absolute -bottom-4 -right-4 h-14 w-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 z-10 border border-border/10">
                  <Camera className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Legal First Name</Label>
                  <Input id="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="h-14 border-none bg-muted/20 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-base font-light" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Legal Last Name</Label>
                  <Input id="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="h-14 border-none bg-muted/20 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-base font-light" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Clinical Email Registry</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input id="email" type="email" value={formData.email || ''} readOnly className="h-14 pl-12 border-none bg-muted/10 opacity-60 rounded-xl text-base font-mono" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="phoneNumber" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Mobile Node</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input id="phoneNumber" type="tel" placeholder="+1 (555) 000-0000" value={formData.phoneNumber || ''} onChange={handleInputChange} className="h-14 pl-12 border-none bg-muted/20 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-base font-light" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="border-border/20" />

        {/* Logistics Node */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-normal">Primary Fulfillment Node</h2>
              <p className="text-sm text-muted-foreground font-light">The destination for your laboratory-verified protocols.</p>
            </div>
          </div>

          <div className="grid gap-10 bg-muted/10 p-8 rounded-3xl border border-dashed border-border/40">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="shippingAddressLine1" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input id="shippingAddressLine1" placeholder="Enter full address" value={formData.shippingAddressLine1 || ''} onChange={handleInputChange} className="h-14 pl-12 border-none bg-background shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">City Node</Label>
                <Input id="shippingCity" placeholder="City" value={formData.shippingCity || ''} onChange={handleInputChange} className="h-14 border-none bg-background shadow-sm rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">State / Region</Label>
                <Input id="shippingStateProvince" placeholder="State" value={formData.shippingStateProvince || ''} onChange={handleInputChange} className="h-14 border-none bg-background shadow-sm rounded-xl" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="shippingPostalCode" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Registry Code (Zip)</Label>
                <Input id="shippingPostalCode" placeholder="00000" value={formData.shippingPostalCode || ''} onChange={handleInputChange} className="h-14 border-none bg-background shadow-sm rounded-xl" />
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleSave}
            disabled={isSaving}
            className="h-16 px-12 rounded-xl uppercase text-[11px] font-bold tracking-[0.3em] w-full md:w-auto shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] bg-primary text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : null}
            SYNCHRONIZE BIO-PROFILE
          </Button>
        </section>

        <Separator className="border-border/20" />

        {/* Security & Keys */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-normal">Digital Sovereignty</h2>
              <p className="text-sm text-muted-foreground font-light">Manage your authentication credentials and encryption nodes.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="border-none shadow-none bg-card rounded-2xl overflow-hidden group border border-border/10">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0 bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-foreground">Authentication Password</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Last synchronized: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Today'}</p>
                  </div>
                </div>
                <Button variant="ghost" className="h-12 px-8 uppercase text-[10px] font-bold tracking-[0.2em] border border-border/20 hover:border-primary hover:text-primary transition-all rounded-md">
                  REPLACE ACCESS KEY <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
