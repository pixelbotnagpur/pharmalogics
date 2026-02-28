'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

const FooterLink = ({ href, children, icon }: { href: string; children: React.ReactNode, icon?: boolean }) => (
  <li>
    <Link href={href} className="text-primary-foreground/90 hover:text-primary-foreground transition-colors font-light flex items-center gap-2">
      {icon && <ArrowUpRight className="h-4 w-4" />}
      {children}
    </Link>
  </li>
);

export function Footer() {
  const db = useFirestore();
  const [time, setTime] = useState('');

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));
    };
    
    updateClock();
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, []);

  const storeName = settings?.storeName || 'Pharmlogics Healthcare';

  return (
    <footer className="bg-primary/90 backdrop-blur-sm text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-primary-foreground/20">
          
          {/* Customer Service Column */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-primary-foreground/20">
            <h3 className="text-sm uppercase tracking-widest text-primary-foreground/70 mb-6">01 / Customer Service</h3>
            <ul className="space-y-4">
              <FooterLink href="/faqs">FAQs</FooterLink>
              <FooterLink href="/blog">Insights</FooterLink>
              <FooterLink href="/delivery-and-returns">Delivery</FooterLink>
              <FooterLink href="/delivery-and-returns">Returns</FooterLink>
              <FooterLink href="/order-tracking" icon>Order Tracking</FooterLink>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-primary-foreground/20">
            <h3 className="text-sm uppercase tracking-widest text-primary-foreground/70 mb-6">02 / Legal</h3>
            <ul className="space-y-4">
              <FooterLink href="/terms-and-conditions">Terms & Conditions</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/cookie-policy">Cookie Policy</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>
          
          {/* Follow Column */}
          <div className="p-8">
            <h3 className="text-sm uppercase tracking-widest text-primary-foreground/70 mb-6">03 / Follow</h3>
            <ul className="space-y-4">
                <FooterLink href="#" icon>Instagram</FooterLink>
                <FooterLink href="#" icon>Twitter</FooterLink>
                <FooterLink href="#" icon>Facebook</FooterLink>
                <FooterLink href="#" icon>Github</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 text-sm font-light text-primary-foreground/70 border-b border-primary-foreground/20">
           <div className="p-8 border-b md:border-b-0 md:border-r border-primary-foreground/20">
            <span>&copy; {new Date().getFullYear()} / {storeName}</span>
           </div>
           <div className="p-8 border-b md:border-b-0 md:border-r border-primary-foreground/20">
            {time && <span>{time}</span>}
           </div>
           <div className="p-8">
            <span>High-Bioavailability Human Optimization</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
