'use server';

import Razorpay from 'razorpay';

/**
 * @fileOverview Server Action for Razorpay order creation.
 * Uses lazy initialization to handle missing environment variables gracefully during build.
 */
export async function createRazorpayOrder(amountInRupees: number, currency: string = 'INR') {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Financial Node Warning: Razorpay keys missing from environment.');
    return {
      success: false,
      error: 'Financial protocol not configured. Please add RAZORPAY keys to Vercel.'
    };
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amountInRupees * 100), // smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    };
  } catch (error: any) {
    console.error('Razorpay Handshake Failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create financial order.'
    };
  }
}
