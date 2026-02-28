'use server';

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Creates a Razorpay order on the server.
 * This is used to initialize the payment session securely.
 * 
 * @param amountInRupees The order total in full currency units.
 * @param currency The ISO currency code (defaults to INR).
 * @returns Object containing order details and the public key for the client.
 */
export async function createRazorpayOrder(amountInRupees: number, currency: string = 'INR') {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are not configured in environment variables.');
  }

  const options = {
    amount: Math.round(amountInRupees * 100), // amount in the smallest currency unit (paise)
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // Required by the client SDK to open the modal
    };
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create payment order.');
  }
}
