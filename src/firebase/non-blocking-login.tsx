'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  ApplicationVerifier,
  ConfirmationResult,
  UserCredential
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await'.
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await'.
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await'.
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await'.
  return signInWithPopup(authInstance, provider);
}

/** 
 * Initiate Phone sign-in.
 * NOTE: This specifically returns a Promise because the flow requires the ConfirmationResult 
 * to proceed to the OTP verification step.
 */
export async function initiatePhoneSignIn(
  authInstance: Auth, 
  phoneNumber: string, 
  verifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(authInstance, phoneNumber, verifier);
}
