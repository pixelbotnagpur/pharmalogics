'use client';

import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

/**
 * @fileOverview LoginContent - Handles the login logic and redirection.
 * Separated into a component to correctly utilize useSearchParams within Suspense.
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const heroImage = PlaceHolderImages.find(p => p.id === 'login_hero');

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  const redirectTo = searchParams.get('redirect') || '/products';

  useEffect(() => {
    if (!isUserLoading && user) {
      // Redirect to the intended destination or default to products
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

  const storeName = settings?.storeName || 'Pharmlogics';

  return (
    <div className="flex flex-col bg-background min-h-dvh">
      <AuthHeader />
      
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Editorial Left Column - Sticky Node */}
        <div className="hidden lg:flex lg:w-1/2 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] flex-col justify-between p-16 overflow-hidden bg-primary text-white relative">
          <div className="relative z-10 text-left flex flex-col items-start pt-12">
            {storeName && <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-white/40">{storeName.toUpperCase()}</p>}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl xl:text-7xl font-headline font-normal leading-[1.1] mb-8"
            >
              Engineering the <br /> Future of <br /> Wellness.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg font-light text-white/80 max-w-md leading-relaxed"
            >
              Access your personalized optimization portal. Track your biological data, manage your clinical-grade subscriptions, and stay at the peak of human performance.
            </motion.p>
          </div>

          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl} 
                alt="Clinical Research" 
                fill 
                className="object-cover opacity-40 grayscale"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center gap-8">
            <div className="h-px flex-1 bg-white/20" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">EST. 2024 / CLINICAL GRADE</p>
          </div>
        </div>

        {/* Form Right Column - Centered Node */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 md:p-12 relative">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 md:p-10 border-none shadow-none bg-card rounded-xl">
              <LoginForm />
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
