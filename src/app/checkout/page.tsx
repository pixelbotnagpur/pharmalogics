'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber, signInAnonymously } from 'firebase/auth';
import { collection, doc } from 'firebase/firestore';

import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useAuth, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { StoreSettings, Coupon, UserProfile } from '@/lib/types';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import { sendClinicalEmail } from '@/app/actions/email';

import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { ContactRegistry } from '@/components/checkout/ContactRegistry';
import { FulfillmentNode } from '@/components/checkout/FulfillmentNode';
import { FinancialProtocol } from '@/components/checkout/FinancialProtocol';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { VerificationDialog } from '@/components/checkout/VerificationDialog';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "AE", label: "United Arab Emirates" },
];

const LOGISTICAL_REGISTRY: Record<string, { states: { value: string, label: string }[], cities: Record<string, string[]> }> = {
  "IN": {
    states: [
      { value: "MH", label: "Maharashtra" },
      { value: "DL", label: "Delhi" },
      { value: "KA", label: "Karnataka" },
      { value: "TN", label: "Tamil Nadu" },
      { value: "TS", label: "Telangana" },
      { value: "UP", label: "Uttar Pradesh" },
      { value: "GJ", label: "Gujarat" },
      { value: "WB", label: "West Bengal" },
    ],
    cities: {
      "MH": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
      "DL": ["New Delhi", "Noida", "Gurgaon", "Faridabad"],
      "KA": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
      "TN": ["Chennai", "Coimbatore", "Madurai", "Salem"],
      "TS": ["Hyderabad", "Warangal", "Nizamabad"],
      "UP": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
      "GJ": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      "WB": ["Kolkata", "Howrah", "Durgapur"],
    }
  },
  "US": {
    states: [
      { value: "FL", label: "Florida" },
      { value: "NY", label: "New York" },
      { value: "CA", label: "California" },
      { value: "TX", label: "Texas" },
      { value: "IL", label: "Illinois" },
    ],
    cities: {
      "FL": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
      "NY": ["New York City", "Buffalo", "Rochester", "Albany"],
      "CA": ["Los Angeles", "San Francisco", "San Diego", "San Jose"],
      "TX": ["Houston", "Austin", "Dallas", "San Antonio"],
      "IL": ["Chicago", "Springfield", "Aurora"],
    }
  }
};

const DEFAULT_CITIES = ["Clinical Hub", "Regional Center", "Global Terminal"];

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc<UserProfile>(userRef);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading: isSettingsLoading } = useDoc<StoreSettings>(settingsRef);
  
  const couponsQuery = useMemoFirebase(() => collection(db, 'coupons'), [db]);
  const { data: coupons } = useCollection<Coupon>(couponsQuery);

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('IN');
  const [shippingState, setShippingState] = useState('');
  const [shippingCity, setShippingCity] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVerifyingCod, setIsVerifyingCod] = useState(false);
  const [codConfirmation, setCodConfirmation] = useState<ConfirmationResult | null>(null);
  const [codOtp, setCodOtp] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [billingError, setBillingError] = useState(false);

  useEffect(() => {
    if (profile) {
      if (!firstName) setFirstName(profile.firstName || '');
      if (!lastName) setLastName(profile.lastName || '');
      if (!email) setEmail(profile.email || '');
      if (!phoneNumber) setPhoneNumber(profile.phoneNumber || '');
      if (!address) setAddress(profile.shippingAddressLine1 || '');
      if (!zip) setZip(profile.shippingPostalCode || '');
      if (profile.shippingCountry) setShippingCountry(profile.shippingCountry);
      if (profile.shippingStateProvince && !shippingState) setShippingState(profile.shippingStateProvince);
      if (profile.shippingCity && !shippingCity) setShippingCity(profile.shippingCity);
    }
  }, [profile, firstName, lastName, email, phoneNumber, address, zip, shippingState, shippingCity]);

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    setDeliveryDate(`${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`);
  }, []);

  const handleApplyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if (!code) return;
    const coupon = coupons?.find(c => c.code === code && c.active);
    if (coupon) {
      let discountVal = coupon.discountType === 'percentage' ? totalPrice * (coupon.discountValue / 100) : coupon.discountValue;
      setAppliedDiscount(discountVal);
      setActiveCoupon(code);
      toast({ title: "Protocol Activated", description: `Clinical discount applied.` });
    } else {
      toast({ variant: "destructive", title: "Invalid Code", description: "Node identifier not recognized." });
      setAppliedDiscount(0);
      setActiveCoupon(null);
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setActiveCoupon(null);
    setCouponInput('');
  };

  const isFreeShipping = totalPrice >= (settings?.freeShippingThreshold || 50);
  const shipping = isFreeShipping ? 0 : (settings?.standardShippingRate || 0);
  const subtotalAfterDiscount = totalPrice - appliedDiscount;
  const taxRate = settings?.taxRate || 0;
  const tax = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + shipping + tax;

  const initiateRazorpayPayment = async () => {
    if (!total || total <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "The acquisition protocol cannot be initialized." });
      return;
    }
    setIsSubmitting(true);
    try {
      const currency = settings?.currencyCode || 'INR';
      const order = await createRazorpayOrder(total, currency);
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: settings?.storeName || "Pharmlogics Healthcare",
        description: "Acquisition of Clinical Formulas",
        image: settings?.logoUrl || "",
        order_id: order.id,
        handler: async function (response: any) {
          completePurchase(response.razorpay_payment_id);
        },
        prefill: { name: `${firstName} ${lastName}`, email: email, contact: phoneNumber },
        theme: { color: "#0000B8" },
        modal: { ondismiss: () => setIsSubmitting(false) }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gateway Failed", description: "The financial protocol could not be initialized." });
      setIsSubmitting(false);
    }
  };

  const initiateCodVerification = async () => {
    if (!phoneNumber) {
      toast({ variant: "destructive", title: "Missing Identifier", description: "A mobile number is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setCodConfirmation(result);
      setIsVerifyingCod(true);
    } catch (error: any) {
      if (error.code === 'auth/billing-not-enabled' || error.code === 'auth/operation-not-allowed') {
        setBillingError(true);
        setIsVerifyingCod(true); 
      } else {
        toast({ variant: "destructive", title: "Verification Failed", description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodOtpConfirm = async () => {
    if (billingError) { completePurchase(); return; }
    if (!codConfirmation || !codOtp) return;
    setIsOtpLoading(true);
    try {
      await codConfirmation.confirm(codOtp);
      completePurchase();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The verification code is incorrect." });
      setIsOtpLoading(false);
    }
  };

  const completePurchase = async (paymentId?: string) => {
    setIsSubmitting(true);
    try {
      let currentUid = auth.currentUser?.uid || user?.uid;
      if (!currentUid) {
        const result = await signInAnonymously(auth);
        currentUid = result.user.uid;
      }
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;
      const orderData = {
        id: orderId,
        customerUid: currentUid,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phoneNumber,
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total: total,
        status: 'Pending Verification',
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Payment',
        paymentId: paymentId || null,
        timeline: [{ status: 'Pending Verification', timestamp: new Date().toISOString(), note: 'Order registry received.' }]
      };

      // 1. Register Order in Firestore
      setDocumentNonBlocking(doc(db, 'orders_global', orderId), orderData);
      setDocumentNonBlocking(doc(db, 'users', currentUid, 'orders', orderId), orderData);

      // 2. Dispatch REAL HTML receipt via Resend (Server Action)
      sendClinicalEmail({
        to: email,
        subject: `[Pharmlogics] Confirmation: Protocol ${orderId} Received`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h1 style="color: #0000B8; margin-bottom: 8px;">Pure Excellence.</h1>
            <p style="color: #666; font-size: 16px;">Greetings, ${firstName}. Your clinical formula acquisition is confirmed.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #999;">Order Identifier</p>
              <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #0000B8;">${orderId}</p>
            </div>
            <p>Your protocols are now queued for laboratory verification at our Miami facility. Lead time is estimated at 3-5 business days.</p>
            <a href="https://pharmlogics.dev/order-tracking?id=${orderId}" style="background: #0000B8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">View Registry Node</a>
            <hr style="margin: 30px 0; border: none; border-top: 1px dashed #ddd;" />
            <p style="font-size: 10px; color: #999; text-transform: uppercase;">Official Registry Handshake Node 01 | Pharmlogics Healthcare</p>
          </div>
        `
      }).then(res => {
        if (res.success) {
          console.log('Resend: Confirmation node synchronized.');
        }
      });

      clearCart();
      router.push(`/checkout/success?id=${orderId}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logistics Error", description: error.message });
      setIsSubmitting(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!email || !firstName || !address || !zip) {
      toast({ variant: "destructive", title: "Registry Incomplete", description: "Mandatory clinical identifiers are missing." });
      return;
    }
    if (paymentMethod === 'cod') initiateCodVerification();
    else initiateRazorpayPayment();
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div id="recaptcha-container"></div>
      <CheckoutHeader settings={settings} isLoading={isSettingsLoading} />
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-12">
          <ContactRegistry email={email} setEmail={setEmail} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} isLoggedIn={!!user} />
          <FulfillmentNode 
            firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName}
            address={address} setAddress={setAddress} zip={zip} setZip={setZip}
            country={shippingCountry} setCountry={setShippingCountry} state={shippingState} setState={setShippingState}
            city={shippingCity} setCity={setShippingCity} countries={COUNTRIES}
            states={LOGISTICAL_REGISTRY[shippingCountry]?.states || []}
            cities={shippingState ? (LOGISTICAL_REGISTRY[shippingCountry]?.cities[shippingState] || DEFAULT_CITIES) : DEFAULT_CITIES}
          />
          <FinancialProtocol paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <OrderSummary 
            cart={cart} totalPrice={totalPrice} settings={settings} isSettingsLoading={isSettingsLoading}
            appliedDiscount={appliedDiscount} activeCoupon={activeCoupon} tax={tax} shipping={shipping}
            isFreeShipping={isFreeShipping} total={total} couponInput={couponInput} setCouponInput={setCouponInput}
            onApplyCoupon={handleApplyCoupon} onRemoveCoupon={handleRemoveCoupon} onAuthorize={handlePurchaseClick}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
      <VerificationDialog 
        open={isVerifyingCod} onOpenChange={setIsVerifyingCod} phoneNumber={phoneNumber} codOtp={codOtp} setCodOtp={setCodOtp}
        onConfirm={handleCodOtpConfirm} isOtpLoading={isOtpLoading} billingError={billingError} onCancel={() => setIsVerifyingCod(false)}
      />
    </div>
  );
}
