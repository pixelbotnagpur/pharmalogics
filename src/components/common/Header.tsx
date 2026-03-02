"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { products } from '@/lib/data';
import type { Product, StoreSettings, UserProfile } from '@/lib/types';
import { DesktopNav } from '@/components/header/DesktopNav';
import { HeaderActions } from '@/components/header/HeaderActions';
import { MobileHeader } from '@/components/header/MobileHeader';
import { useMegaMenu } from '@/hooks/use-mega-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

// Dynamic imports for heavy panels to optimize initial bundle weight and TTI
const MegaMenu = dynamic(() => import('@/components/header/MegaMenu').then(mod => mod.MegaMenu), { ssr: false });
const SearchSheet = dynamic(() => import('@/components/header/SearchSheet').then(mod => mod.SearchSheet), { ssr: false });
const CartSheet = dynamic(() => import('@/components/cart/CartSheet').then(mod => mod.CartSheet), { ssr: false });
const AccountSheet = dynamic(() => import('@/components/header/AccountSheet').then(mod => mod.AccountSheet), { ssr: false });

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { addItem, isCartOpen, setIsCartOpen } = useCart();
  const { isMegaMenuOpen, setIsMegaMenuOpen } = useMegaMenu();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const pathname = usePathname();

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profileData } = useDoc<UserProfile>(profileRef);

  const isLoggedIn = !!user;
  
  const userData = useMemo(() => {
    if (!user) return { name: '', email: '', initials: '' };
    
    const firstName = profileData?.firstName || '';
    const lastName = profileData?.lastName || '';
    
    const name = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : (user.displayName || 'Clinical User');
      
    const initials = firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (user.displayName || user.email || 'U')
          .split(' ')
          .map(n => n?.[0] || '')
          .join('')
          .toUpperCase()
          .slice(0, 2);
          
    return { name, email: user.email || '', initials };
  }, [user, profileData]);

  const isTransparentPage = useMemo(() => {
    if (!pathname) return false;
    const transparentPaths = [
      '/', 
      '/products', 
      '/about', 
      '/faqs', 
      '/contact', 
      '/blog',
      '/delivery-and-returns',
      '/terms-and-conditions',
      '/privacy-policy',
      '/cookie-policy'
    ];
    return transparentPaths.includes(pathname) || 
           pathname.startsWith('/blog/') || 
           pathname.startsWith('/products/category/');
  }, [pathname]);

  const isAnyMenuOpen = isMegaMenuOpen || isCartOpen || isSearchMenuOpen || isMobileMenuOpen || isAccountOpen;
  const isHeaderPrimary = scrolled || isAnyMenuOpen;
  const useDarkText = !isHeaderPrimary && !isTransparentPage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (isMegaMenuOpen) {
      setIsCartOpen(false); setIsSearchMenuOpen(false); setIsMobileMenuOpen(false); setIsAccountOpen(false);
    }
  }, [isMegaMenuOpen, setIsCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      setIsMegaMenuOpen(false); setIsSearchMenuOpen(false); setIsMobileMenuOpen(false); setIsAccountOpen(false);
    }
  }, [isCartOpen, setIsMegaMenuOpen]);

  useEffect(() => {
    if (isAccountOpen) {
      setIsMegaMenuOpen(false); setIsCartOpen(false); setIsSearchMenuOpen(false); setIsMobileMenuOpen(false);
    }
  }, [isAccountOpen, setIsMegaMenuOpen, setIsCartOpen]);

  useEffect(() => {
    if (isSearchMenuOpen) {
      setIsMegaMenuOpen(false); setIsCartOpen(false); setIsAccountOpen(false); setIsMobileMenuOpen(false);
    }
  }, [isSearchMenuOpen, setIsMegaMenuOpen, setIsCartOpen]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isAnyMenuOpen ? 'hidden' : '';
    }
  }, [isAnyMenuOpen]);

  useEffect(() => {
    setIsMegaMenuOpen(false); setIsSearchMenuOpen(false); setIsMobileMenuOpen(false); setIsCartOpen(false); setIsAccountOpen(false);
  }, [pathname, setIsMegaMenuOpen, setIsCartOpen]);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 });
  };

  const handleLogout = () => { signOut(auth); setIsAccountOpen(false); };

  const popularProducts = products.slice(0, 3);
  const commitmentLinks = [
    { href: "#", label: "Natural Ingredients" },
    { href: "#", label: "Scientifically Formulated" },
    { href: "#", label: "AI-Powered Insights" },
    { href: "#", label: "Subscription Service" },
  ];

  const mobileNavItems = [
    { href: "/products", label: "Shop" }, 
    { href: "/about", label: "About" }, 
    { href: "/faqs", label: "FAQs" },
    { href: "/blog", label: "Insights" }
  ];

  return (
    <>
      <AnimatePresence>
        {isAnyMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => { setIsMegaMenuOpen(false); setIsCartOpen(false); setIsSearchMenuOpen(false); setIsMobileMenuOpen(false); setIsAccountOpen(false); }}
          />
        )}
      </AnimatePresence>

      <header className={cn(
          "fixed top-0 w-full p-4 transition-all duration-500",
          isAnyMenuOpen ? "z-50" : "z-40",
          isHeaderPrimary ? "bg-primary" : (!isTransparentPage ? "bg-card" : "bg-transparent")
      )}>
        <div className="relative z-50 flex h-8 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {settings && (
              settings.logoUrl && settings.logoWhiteUrl ? (
                <img src={useDarkText ? settings.logoUrl : settings.logoWhiteUrl} alt={settings.storeName} className="h-8 w-auto transition-all duration-300" />
              ) : (
                <span className={cn("font-headline text-2xl font-normal transition-colors duration-300", useDarkText ? "text-primary" : "text-white")}>{settings.storeName}</span>
              )
            )}
          </Link>
          
          <DesktopNav useDarkText={useDarkText} />

          <HeaderActions
            isLoggedIn={isLoggedIn}
            user={userData}
            scrolled={scrolled}
            isSearchMenuOpen={isSearchMenuOpen}
            onSearchClick={() => setIsSearchMenuOpen(prev => !prev)}
            isTransparentPage={isTransparentPage}
            isAnyMenuOpen={isAnyMenuOpen}
            isAccountOpen={isAccountOpen}
            setIsAccountOpen={setIsAccountOpen}
            onLogout={handleLogout}
            useDarkText={useDarkText}
          />
          
          <MobileHeader
            isLoggedIn={isLoggedIn}
            scrolled={scrolled}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onSearchClick={() => setIsSearchMenuOpen(prev => !prev)}
            handleAddToCart={handleAddToCart}
            products={products}
            mobileNavItems={mobileNavItems}
            isTransparentPage={isTransparentPage}
            isAnyMenuOpen={isAnyMenuOpen}
            useDarkText={useDarkText}
          />
        </div>
      </header>

      <MegaMenu commitmentLinks={commitmentLinks} />
      <SearchSheet isOpen={isSearchMenuOpen} onOpenChange={setIsSearchMenuOpen} popularProducts={popularProducts} handleAddToCart={handleAddToCart} />
      <CartSheet />
      <AccountSheet 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        user={userData}
        onLogout={handleLogout}
      />
    </>
  );
}
