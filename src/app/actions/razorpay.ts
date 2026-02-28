'use server';

import Razorpay from 'razorpay';

/**
 * @fileOverview Server Action for Razorpay order creation.
 * Returns a result object instead of throwing to prevent Internal Server Errors (500).
 */
export async function createRazorpayOrder(amountInRupees: number, currency: string = 'INR') {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay Error: API keys missing from environment.');
    throw new Error('Financial protocol not configured. Please add RAZORPAY keys.');
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amountInRupees * 100), // smallest currency unit
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
      error: error.message || 'Failed to create payment order.'
    };
  }
}
