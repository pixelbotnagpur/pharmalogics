
export type ProductCategory = string;

export type PackOption = {
  label: string;
  count: number;
  discountMultiplier: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageSrc: string;
  imageHint: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  shippingAddressLine1?: string;
  shippingCity?: string;
  shippingStateProvince?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressMetrics = {
  focus: number;
  energy: number;
  sleep: number;
  immunity: number;
  recovery: number;
};

export type ProgressLog = {
  id: string;
  userId: string;
  date: string;
  metrics: ProgressMetrics;
  notes?: string;
};

export type ProductCategoryInfo = {
    name: string;
    description: string;
    href: string;
    imageSrc: string;
    imageHint: string;
}

export type DetailedBenefit = {
  title: string;
  description: string;
};

export type FeaturedIngredient = {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type IngredientItem = {
  name: string;
  amount: string;
};

export type AdvantageItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type SEOData = {
  title: string;
  description: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  subscriptionDiscount?: number;
  category: ProductCategory;
  description: string;
  benefits: string[];
  ingredients: string[];
  dosage: string;
  stock: number;
  imageUrl: string;
  imageHint: string;
  gallery: { imageUrl: string; imageHint: string; }[];
  availablePacks?: PackOption[];
  includedItems?: string[];
  flavor?: string;
  detailedBenefits?: DetailedBenefit[];
  usageInstructions?: string[];
  deliveryInfo?: string;
  sustainabilityInfo?: string;
  featuredIngredients?: FeaturedIngredient[];
  fullIngredientsList?: IngredientItem[];
  advantageSection?: {
    items: AdvantageItem[];
  };
  seoTitle?: string;
  seoDescription?: string;
};

export type Insight = {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: 'RESEARCH' | 'CLINICAL' | 'OPTIMIZATION';
  imageUrl: string;
  imageHint: string;
  readTime: string;
  authorName: string;
  authorTitle: string;
  date: string;
  published: boolean;
  updatedAt: string;
};

export type OrderStatus = 
  | 'Pending Verification' 
  | 'Clinical Verification' 
  | 'Lab Preparation' 
  | 'Sterile Packaging' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled';

export type LifecycleEvent = {
  status: OrderStatus | string;
  timestamp: string;
  note: string;
};

export type QCReport = {
  batchId: string;
  verifiedAt: string;
  purityScore: number;
  reportText: string;
};

export type Order = {
  id: string;
  createdAt: string | any;
  total: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { name: string; quantity: number; productId?: string; frequency?: number }[];
  timeline?: LifecycleEvent[];
  qcReport?: QCReport;
  paymentId?: string;
  paymentMethod?: string;
  currency?: string;
};

export type Subscription = {
  id: string;
  productName: string;
  imageUrl: string;
  frequency: number;
  nextBillingDate?: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  price: number;
  createdAt?: string;
};

export type StoreSettings = {
  id: string;
  storeName: string;
  taxRate: number;
  standardShippingRate: number;
  currencyCode: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  logoUrl?: string;
  logoWhiteUrl?: string;
  faviconUrl?: string;
  megaMenuBgUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  foregroundColor?: string;
  mutedColor?: string;
  cardColor?: string;
  borderColor?: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WebPage = {
  id: string;
  title: string;
  content: any;
  updatedAt: string;
};
