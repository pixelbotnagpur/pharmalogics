
'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { WebPage, StoreSettings, Product, Category } from '@/lib/types';

/**
 * @fileOverview SEOManager handles dynamic document titles and meta tags
 * based on the active node in the cloud registry (Pages, Products, or Categories).
 */
export function SEOManager() {
  const pathname = usePathname();
  const db = useFirestore();
  
  // Resolve Collection and Node ID from Pathname
  const { collectionName, docId } = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return { collectionName: 'pages', docId: 'home' };
    
    if (parts[0] === 'products') {
      if (parts.length === 1) return { collectionName: 'pages', docId: 'products' };
      if (parts[1] === 'category' && parts[2]) return { collectionName: 'categories', docId: parts[2] };
      return { collectionName: 'products', docId: parts[1] };
    }
    
    if (parts[0] === 'bundles' && parts[1]) {
      return { collectionName: 'products', docId: parts[1] };
    }
    
    // Check if it's a core page like /about, /faqs, etc.
    const knownPages = ['about', 'faqs', 'contact', 'delivery-and-returns', 'terms-and-conditions', 'privacy-policy', 'cookie-policy'];
    if (knownPages.includes(parts[0])) return { collectionName: 'pages', docId: parts[0] };
    
    return { collectionName: 'pages', docId: 'home' };
  }, [pathname]);
  
  const nodeRef = useMemoFirebase(() => doc(db, collectionName, docId), [db, collectionName, docId]);
  const { data: nodeData } = useDoc<any>(nodeRef);
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  useEffect(() => {
    const storeName = settings?.storeName || 'Pharmlogics Healthcare';
    
    let metaTitle = '';
    let metaDesc = '';

    // Resolve based on collection type
    if (collectionName === 'pages') {
      const page = nodeData as WebPage | null;
      metaTitle = page?.content?.seo?.title || page?.title || 'Pure clinical excellence';
      metaDesc = page?.content?.seo?.description || '';
    } else if (collectionName === 'products') {
      const product = nodeData as Product | null;
      metaTitle = product?.seoTitle || product?.name || 'Scientific Formula';
      metaDesc = product?.seoDescription || product?.description || '';
    } else if (collectionName === 'categories') {
      const category = nodeData as Category | null;
      metaTitle = category?.seoTitle || category?.name || 'Clinical Category';
      metaDesc = category?.seoDescription || category?.description || '';
    }

    // Update Document Title
    document.title = `${metaTitle} | ${storeName}`;

    // Update Meta Description
    let metaDescriptionEl = document.querySelector('meta[name="description"]');
    if (!metaDescriptionEl) {
      metaDescriptionEl = document.createElement('meta');
      metaDescriptionEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionEl);
    }
    
    const finalDesc = metaDesc || 'Discover premium, science-backed supplements designed for your health goals. High-bioavailability human optimization.';
    metaDescriptionEl.setAttribute('content', finalDesc);

  }, [nodeData, settings, collectionName, pathname]);

  return null;
}
