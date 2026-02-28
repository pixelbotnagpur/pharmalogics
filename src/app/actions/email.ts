'use server';

import { Resend } from 'resend';

/**
 * CONFIGURATION NODE:
 * Once you verify your domain in the Resend Dashboard (Domains > Add Domain),
 * update the RESEND_FROM_EMAIL environment variable to your verified address.
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Pharmlogics <onboarding@resend.dev>';

/**
 * Dispatches a clinical email via Resend.
 * Returns a result object to prevent unhandled server exceptions.
 */
export async function sendClinicalEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email remains in dry-run mode.');
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Clinical Email dispatch failed:', err);
    return { success: false, error: err.message || 'Unknown dispatch error' };
  }
}
