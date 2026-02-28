'use client';

import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

function SignUpContent() {
  const router = useRouter();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const heroImage = PlaceHolderImages.find(p => p.id === 'signup_hero');
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  const redirectTo = searchParams.get('redirect') || '/products';

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isUserLoading, router, redirectTo]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const storeName = settings?.storeName || '';

  return (
    <div className="flex flex-col bg-background min-h-dvh">
      <AuthHeader />
      
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Form Left Column - Centered Node */}
        <div className="flex w-full lg:w-3/5 flex-col items-center justify-center p-8 md:p-16 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 border-none shadow-none bg-card rounded-xl">
              <SignUpForm redirectPath={redirectTo} />
            </Card>
          </motion.div>
        </div>

        {/* Editorial Right Column - Sticky Node */}
        <div className="hidden lg:flex lg:w-2/5 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] flex-col justify-between p-16 overflow-hidden bg-accent text-white relative">
          <div className="relative z-10 text-left flex flex-col items-start pt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">JOIN THE OPTIMIZED</p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl xl:text-6xl font-headline font-normal leading-[1.1] mb-8"
            >
              Your biological <br /> revolution <br /> starts here.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base font-light text-white/80 max-w-md leading-relaxed"
            >
              Establish your profile in the {storeName || 'clinical'} registry. Verified identity is required for high-bioavailability prescription-grade protocols.
            </motion.p>
          </div>

          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl} 
                alt="Performance Athlete" 
                fill 
                className="object-cover opacity-40 grayscale"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/80 via-accent/40 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center gap-8">
            <div className="h-px flex-1 bg-white/20" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 leading-relaxed text-right">
              *Clinical data stored via <br /> end-to-end encrypted nodes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
