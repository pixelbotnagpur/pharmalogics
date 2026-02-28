'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';
import { ArrowLeft, Lock } from 'lucide-react';

/**
 * @fileOverview AuthHeader - A specialized header for authentication nodes.
 * Synchronized with the primary clinical brand aesthetic.
 */
export function AuthHeader() {
  const pathname = usePathname();
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  const isAdmin = pathname?.startsWith('/admin') || false;
  const isLogin = pathname?.includes('login') || false;

  return (
    <header className="w-full h-16 px-4 border-b border-white/10 bg-primary z-50 shrink-0 sticky top-0 flex items-center">
      <div className="container mx-auto flex h-full items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settings && (
            settings.logoWhiteUrl ? (
              <img 
                src={settings.logoWhiteUrl} 
                alt={settings.storeName} 
                className="h-7 w-auto transition-opacity duration-500" 
              />
            ) : (
              <span className="font-headline text-xl text-white">
                {settings.storeName}
              </span>
            )
          )}
        </Link>

        <div className="flex items-center gap-4 sm:gap-8">
          <Link 
            href="/" 
            className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3 w-3" /> <span className="hidden xs:inline">Back to site</span>
          </Link>
          
          <nav className="flex items-center gap-4 border-l border-white/20 pl-4 sm:pl-8">
            {isLogin ? (
              <Link 
                href={isAdmin ? "/admin/signup" : "/signup"} 
                className="text-[10px] font-bold uppercase tracking-widest text-white hover:underline"
              >
                Create Account
              </Link>
            ) : (
              <Link 
                href={isAdmin ? "/admin/login" : "/login"} 
                className="text-[10px] font-bold uppercase tracking-widest text-white hover:underline"
              >
                Sign In
              </Link>
            )}
          </nav>

          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 text-white/60 border-l border-white/20 pl-8">
              <Lock className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Admin Node</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
