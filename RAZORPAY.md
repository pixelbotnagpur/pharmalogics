# Razorpay Payment Gateway Integration Guide

This guide provides the complete code and setup instructions for integrating the Razorpay payment gateway into a Next.js application, supporting **UPI, Cards, Net Banking, and Wallets**.

## 1. Prerequisites

### Install Dependencies
```bash
npm install razorpay
```

### Environment Variables (.env.local)
Ensure you have your Razorpay API keys from the Razorpay Dashboard.
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

## 2. Server-Side: Create Order Action

This server action securely creates a Razorpay order and passes the `key_id` to the client.

**File: `src/app/actions/razorpay.ts`**
```typescript
'use server';

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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
      key: process.env.RAZORPAY_KEY_ID, // Required by the client SDK
    };
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create payment order.');
  }
}
```

---

## 3. Client-Side: Checkout Page

The client-side implementation handles the script loading, order creation trigger, and the interactive payment modal.

**File: `src/app/checkout/page.tsx`**
```tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { createRazorpayOrder } from '@/app/actions/razorpay';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on server
      const order = await createRazorpayOrder(29); // Example amount: ₹29

      // 2. Configure Razorpay options
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Purchase Description",
        image: "/your-logo.svg",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Handle successful payment
          console.log("Payment ID:", response.razorpay_payment_id);
          alert("Payment Successful!");
          // Save to database here (e.g., Firestore)
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
        },
        theme: {
          color: "#6d28d9", // Brand color
        },
      };

      // 4. Open Razorpay Modal
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? "Loading..." : "Pay Now"}
      </button>
    </div>
  );
}
```

---

## 4. Payment Options Supported
By default, the standard Razorpay checkout modal supports:
- **UPI**: Google Pay, PhonePe, Paytm, etc.
- **Cards**: All major Debit and Credit cards.
- **Net Banking**: All major Indian banks.
- **Wallets**: Mobikwik, Freecharge, etc.

No additional code is needed to enable these; they are managed via your Razorpay Dashboard settings.
