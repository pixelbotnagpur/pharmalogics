
'use client';

import { useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { StoreSettings } from '@/lib/types';

/**
 * @fileOverview Dynamically injects CSS variables into the document head
 * based on the Firestore StoreSettings registry.
 */
export function ThemeInjector() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc<StoreSettings>(settingsRef);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // ShadCN Variable Mapping
    const colorMap: Record<string, string | undefined> = {
      '--primary': settings.primaryColor,
      '--background': settings.backgroundColor,
      '--accent': settings.accentColor,
      '--secondary': settings.secondaryColor,
      '--foreground': settings.foregroundColor,
      '--muted': settings.mutedColor,
      '--card': settings.cardColor,
      '--border': settings.borderColor,
    };

    Object.entries(colorMap).forEach(([variable, value]) => {
      if (value) {
        root.style.setProperty(variable, value);
      }
    });

    // Update favicon if provided
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  return null;
}
