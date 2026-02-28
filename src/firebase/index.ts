'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * @fileOverview Firebase Service Orchestrator.
 * Handles dual-environment initialization (Firebase App Hosting vs. Vercel/Local).
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    
    try {
      /**
       * INITIALIZATION PROTOCOL:
       * 1. Detect environment.
       * 2. If Vercel or Local, prioritize the explicit config object to avoid build-time warnings.
       * 3. If Firebase App Hosting, utilize the parameter-less initializeApp().
       */
      const isExplicitConfigPreferred = 
        process.env.NEXT_PUBLIC_VERCEL_ENV || 
        process.env.NODE_ENV === 'development' ||
        !process.env.FIREBASE_CONFIG;

      if (isExplicitConfigPreferred) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        firebaseApp = initializeApp();
      }
    } catch (e) {
      // Robust fallback to client-side config object
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
