
import type { Product, Order, Subscription, ProductCategoryInfo, PackOption } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img || { imageUrl: `https://picsum.photos/seed/${id}/600/600`, imageHint: "supplement bottle" };
}

const defaultPacks: PackOption[] = [
    { label: 'Single', count: 1, discountMultiplier: 1 },
    { label: '3-Pack', count: 3, discountMultiplier: 0.9 },
    { label: '6-Pack', count: 6, discountMultiplier: 0.8 },
];

export const productCategories: ProductCategoryInfo[] = [
    {
        name: 'Heart & Brain',
        description: 'Support for your cardiovascular and cognitive health.',
        href: '/products/category/heart-brain',
        imageSrc: getImage('prod_001').imageUrl,
        imageHint: getImage('prod_001').imageHint,
    },
    {
        name: 'Bone & Immune',
        description: 'Strengthen your bones and bolster your immune system.',
        href: '/products/category/bone-immune',
        imageSrc: getImage('prod_002').imageUrl,
        imageHint: getImage('prod_002').imageHint,
    },
    {
        name: 'Digestion',
        description: 'Promote a healthy gut microbiome and digestive function.',
        href: '/products/category/digestion',
        imageSrc: getImage('prod_003').imageUrl,
        imageHint: getImage('prod_003').imageHint,
    },
    {
        name: 'General Wellness',
        description: 'A foundation for your overall health and vitality.',
        href: '/products/category/general-wellness',
        imageSrc: getImage('prod_004').imageUrl,
        imageHint: getImage('prod_004').imageHint,
    },
    {
        name: 'Relaxation & Sleep',
        description: 'Calm your mind and support a restful night\'s sleep.',
        href: '/products/category/relaxation-sleep',
        imageSrc: getImage('prod_005').imageUrl,
        imageHint: getImage('prod_005').imageHint,
    },
    {
        name: 'Joint Health',
        description: 'Soothe your joints and support healthy inflammatory responses.',
        href: '/products/category/joint-health',
        imageSrc: getImage('prod_006').imageUrl,
        imageHint: getImage('prod_006').imageHint,
    },
]

export const products: Product[] = [
  {
    id: 'prod_001',
    sku: 'PL-OMG3-120S',
    name: 'Omega-3 Fish Oil',
    price: 59.99,
    category: 'Heart & Brain',
    description: 'High-potency Omega-3 fish oil for cardiovascular health and brain function. Sourced from wild-caught fish.',
    benefits: ['Supports Heart Health', 'Boosts Brain Function', 'Reduces Inflammation'],
    ingredients: ['Fish Oil Concentrate', 'EPA', 'DHA', 'Gelatin'],
    dosage: 'Take 2 softgels daily with a meal.',
    stock: 120,
    imageUrl: getImage('prod_001').imageUrl,
    imageHint: getImage('prod_001').imageHint,
    gallery: [getImage('prod_001'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
  {
    id: 'prod_002',
    sku: 'PL-VITD3-5K',
    name: 'Vitamin D3 5000 IU',
    price: 59.99,
    category: 'Bone & Immune',
    description: 'Essential Vitamin D3 for bone health, immune support, and mood regulation. Fast-absorbing softgel.',
    benefits: ['Strengthens Bones', 'Supports Immune System', 'Improves Mood'],
    ingredients: ['Vitamin D3 (as Cholecalciferol)', 'Olive Oil', 'Softgel Capsule'],
    dosage: 'Take 1 softgel daily.',
    stock: 250,
    imageUrl: getImage('prod_002').imageUrl,
    imageHint: getImage('prod_002').imageHint,
    gallery: [getImage('prod_002'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
  {
    id: 'prod_003',
    sku: 'PL-PROB-50B',
    name: 'Probiotic Blend',
    price: 59.99,
    category: 'Digestion',
    description: 'A diverse blend of 50 billion CFUs to support gut health, digestion, and a balanced microbiome.',
    benefits: ['Promotes Gut Health', 'Aids Digestion', 'Boosts Immunity'],
    ingredients: ['Lactobacillus acidophilus', 'Bifidobacterium lactis', 'Prebiotic Fiber'],
    dosage: 'Take 1 capsule daily on an empty stomach.',
    stock: 85,
    imageUrl: getImage('prod_003').imageUrl,
    imageHint: getImage('prod_003').imageHint,
    gallery: [getImage('prod_003'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
  {
    id: 'prod_004',
    sku: 'PL-MULT-GEN',
    name: 'Multivitamin Complex',
    price: 59.99,
    category: 'General Wellness',
    description: 'A complete daily multivitamin with essential vitamins and minerals for overall health and wellness.',
    benefits: ['Fills Nutritional Gaps', 'Boosts Energy Levels', 'Supports Overall Health'],
    ingredients: ['Vitamin A, C, D, E, B-Complex', 'Zinc', 'Magnesium', 'Selenium'],
    dosage: 'Take 2 tablets daily with food.',
    stock: 300,
    imageUrl: getImage('prod_004').imageUrl,
    imageHint: getImage('prod_004').imageHint,
    gallery: [getImage('prod_004'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
  {
    id: 'prod_005',
    sku: 'PL-MAGN-GLY',
    name: 'Magnesium Glycinate',
    price: 59.99,
    category: 'Relaxation & Sleep',
    description: 'Highly absorbable form of magnesium that supports muscle relaxation, sleep quality, and stress reduction.',
    benefits: ['Improves Sleep Quality', 'Reduces Muscle Cramps', 'Calms Nervous System'],
    ingredients: ['Magnesium (as Magnesium Glycinate)', 'Vegetable Cellulose'],
    dosage: 'Take 2 capsules before bedtime.',
    stock: 150,
    imageUrl: getImage('prod_005').imageUrl,
    imageHint: getImage('prod_005').imageHint,
    gallery: [getImage('prod_005'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
  {
    id: 'prod_006',
    sku: 'PL-TURM-CUR',
    name: 'Turmeric Curcumin',
    price: 59.99,
    category: 'Joint Health',
    description: 'Powerful anti-inflammatory support with high-potency turmeric extract and black pepper for enhanced absorption.',
    benefits: ['Reduces Joint Pain', 'Powerful Antioxidant', 'Supports Liver Health'],
    ingredients: ['Turmeric Root Extract', 'Curcuminoids', 'Black Pepper Extract (BioPerine)'],
    dosage: 'Take 2 capsules daily.',
    stock: 95,
    imageUrl: getImage('prod_006').imageUrl,
    imageHint: getImage('prod_006').imageHint,
    gallery: [getImage('prod_006'), getImage('prod_gallery_2'), getImage('prod_gallery_3'), getImage('prod_gallery_4')],
    availablePacks: defaultPacks,
  },
];

export const bundles: Product[] = [
  {
    id: 'wellness-starter-kit',
    sku: 'PL-BUND-W01',
    name: 'Wellness Starter Kit',
    price: 199.99,
    category: 'Bundles',
    description: 'The ultimate foundational kit. Four full-size bottles of our essential science-backed formulas to kickstart your natural wellness journey.',
    benefits: ['Foundational Health Support', 'Optimized Value', 'Science-Backed Synergy'],
    ingredients: ['Multi-Vitamin', 'Omega-3', 'Probiotics', 'Magnesium'],
    dosage: 'See individual bottles for dosage instructions.',
    stock: 50,
    imageUrl: getImage('bundle_pack').imageUrl,
    imageHint: getImage('bundle_pack').imageHint,
    gallery: [getImage('bundle_pack'), getImage('prod_gallery_1'), getImage('prod_gallery_2')],
    includedItems: ['Multivitamin Complex', 'Omega-3 Fish Oil', 'Probiotic Blend', 'Magnesium Glycinate'],
  }
];

export const orders: Order[] = [
    {
      id: 'ORD-2024-001',
      date: '2024-07-15',
      total: 117.48,
      status: 'Delivered',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      items: [
        { name: 'Omega-3 Fish Oil', quantity: 1 },
        { name: 'Probiotic Blend', quantity: 1 },
      ],
    },
    {
      id: 'ORD-2024-002',
      date: '2024-08-01',
      total: 59.99,
      status: 'Shipped',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.j@outlook.com',
      items: [{ name: 'Vitamin D3 5000 IU', quantity: 1 }],
    },
    {
      id: 'ORD-2024-003',
      date: '2024-08-10',
      total: 119.98,
      status: 'Lab Preparation',
      customerName: 'Michael Chen',
      customerEmail: 'm.chen@tech.co',
      items: [{ name: 'Magnesium Glycinate', quantity: 2 }],
    },
    {
      id: 'ORD-2024-004',
      date: '2024-08-12',
      total: 199.99,
      status: 'Clinical Verification',
      customerName: 'Elena Gilbert',
      customerEmail: 'elena@mystic.net',
      items: [{ name: 'Wellness Starter Kit', quantity: 1 }],
    },
  ];
  
  export const subscriptions: Subscription[] = [
    {
      id: 'SUB-001',
      productName: 'Omega-3 Fish Oil',
      imageUrl: getImage('prod_001').imageUrl,
      frequency: 30,
      nextBillingDate: '2024-09-15',
      status: 'Active',
      price: 50.99, // discounted price
    },
    {
      id: 'SUB-002',
      productName: 'Probiotic Blend',
      imageUrl: getImage('prod_003').imageUrl,
      frequency: 60,
      nextBillingDate: '2024-10-20',
      status: 'Active',
      price: 50.99,
    },
    {
      id: 'SUB-003',
      productName: 'Vitamin D3 5000 IU',
      imageUrl: getImage('prod_002').imageUrl,
      frequency: 90,
      nextBillingDate: '2024-09-05',
      status: 'Paused',
      price: 50.99,
    },
  ];
