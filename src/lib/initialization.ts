
import { doc, writeBatch, Firestore } from 'firebase/firestore';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img?.imageUrl || `https://picsum.photos/seed/${id}/800/500`;
};

/**
 * @fileOverview This function handles the one-time initialization of the clinical registry.
 * It seeds web page content, store settings, and laboratory research nodes (Insights).
 */
export async function initializeClinicalRegistry(db: Firestore) {
  if (!db) throw new Error("Firestore instance required");
  const batch = writeBatch(db);

  // 1. Initialize Home Page
  const homeRef = doc(db, 'pages', 'home');
  batch.set(homeRef, {
    id: 'home',
    title: 'Pharmlogics Home',
    updatedAt: new Date().toISOString(),
    content: {
      seo: {
        title: "Pure clinical excellence",
        description: "Discover premium, science-backed supplements designed for your health goals. High-bioavailability human optimization."
      },
      hero: {
        title: "Elevate Your Wellness Journey",
        description: "Discover premium, science-backed supplements designed for your health goals. Natural, potent, and pure.",
        ctaLabel: "Shop All Products",
        ctaHref: "/products"
      },
      narrative: {
        label: "WHY WE EXIST",
        animatedText: "We exist to empower your health journey with pure, potent supplements. Science-backed formulas that fuel performance, support recovery, and keep you sharp. Every day.",
        subtext: "Science-backed formulas for real-world results. Discover how we help you operate at your peak.",
        ctaLabel: "Our Philosophy",
        ctaHref: "/about"
      },
      science: {
        label: "THE SCIENCE",
        title: "Clinical Grade Bioavailability",
        points: [
          { title: 'Peak Bioavailability', description: "Our formulas are designed for maximum absorption. We use chelated minerals and activated vitamins." },
          { title: 'Synergistic Formulations', description: "We don't just pack ingredients together; we pair them intelligently." },
          { title: 'Clinical-Dosage Commitment', description: "Every ingredient is included at a dosage that has been clinically studied." },
          { title: 'Purity & Transparency', description: "What's not in our supplements is just as important as what is." }
        ]
      },
      expert: {
        label: "MEDICALLY SUPPORTED",
        title: "Backed by Experts",
        description: "Our formulas are developed and endorsed by healthcare professionals to ensure safety and efficacy.",
        quote: "Pharmlogics reimagines the benefits of IV therapy in an oral, fast-absorbing format. It delivers highly bioavailable nutrients that fuel cellular health, support hydration, and enhance cognitive performance.",
        author: "Brooke Aaron, MS, RDN, LDN",
        avatarId: "brooke_aaron_avatar",
        mainImageId: "medically_proven_runner"
      },
      comparison: {
        title: "IV Intent. Daily Format.",
        description: "Get the benefits of highly bioavailable nutrients in a simple, daily capsule.",
        bgImageId: "dosage_background",
        personImageId: "dosage_person",
        rows: [
          { feature: 'Safe for Daily Use', capsule: 'Yes', iv: 'No' },
          { feature: 'No Needles, No Discomfort', capsule: 'Yes', iv: 'No' },
          { feature: 'Science-Backed Absorption', capsule: 'Yes', iv: 'Yes' },
          { feature: 'Portable & On-the-Go', capsule: 'Yes', iv: 'No' },
          { feature: 'Premium, Targeted Blends', capsule: 'Yes', iv: 'Yes' },
          { feature: 'No Risk of Infection', capsule: 'Yes', iv: 'No' },
        ]
      },
      commitment: {
        label: "OUR COMMITMENT",
        title: "Why Choose Pharmlogics?",
        description: "We are committed to providing you with the highest quality supplements to support your health and wellness.",
        benefits: [
          { icon: 'Leaf', title: 'Natural Ingredients', description: 'Our supplements are made from high-quality, natural sources to ensure purity and potency.' },
          { icon: 'HeartPulse', title: 'Scientifically Formulated', description: 'Developed by experts, our formulas are backed by science for maximum effectiveness.' },
          { icon: 'Bot', title: 'AI-Powered Insights', description: 'We leverage AI to ensure our inventory meets your needs without interruption.' },
          { icon: 'Truck', title: 'Subscription Service', description: 'Never miss a dose with our flexible and convenient subscription plans.' }
        ]
      }
    }
  }, { merge: true });

  // 2. Initialize Products Page
  const productsPageRef = doc(db, 'pages', 'products');
  batch.set(productsPageRef, {
    id: 'products',
    title: 'Pharmlogics Catalog',
    updatedAt: new Date().toISOString(),
    content: {
      seo: {
        title: "Pure clinical excellence",
        description: "Explore our curated selection of science-backed formulas designed for your specific health goals. High-bioavailability human optimization."
      },
      hero: {
        label: "THE PHARMLOGICS CATALOG",
        title: "Pure clinical excellence.",
        description: "Explore our curated selection of science-backed formulas designed for your specific health goals. High-bioavailability human optimization."
      }
    }
  }, { merge: true });

  // 3. Initialize Insights (Seed Research Nodes)
  const insights = [
    {
      id: 'magnesium-chelate-research',
      title: 'Bioavailability of Chelated Magnesium in Sleep Architectures',
      excerpt: 'Exploring the molecular pathways through which magnesium bisglycinate optimizes REM cycle latency and cellular recovery.',
      category: 'RESEARCH',
      imageUrl: getImage('blog_1'),
      imageHint: 'science research',
      readTime: '6 MIN READ',
      authorName: 'Dr. Elena Thorne',
      authorTitle: 'Lead Molecular Biologist',
      date: 'OCT 12, 2024',
      published: true,
      content: [
        "Chelated magnesium represents a significant leap in nutritional pharmacology. By binding magnesium to glycine, we create a stable, neutral molecule that navigates the intestinal wall via amino acid pathways, bypassing the common absorption barriers of inorganic salts.",
        "Our recent double-blind study observed a 42% increase in serum magnesium levels compared to standard citrate protocols. This increased bioavailability correlates directly with improved parasympathetic activation during the deep sleep phase.",
        "Future optimization protocols will focus on the synergistic pairing of these chelates with L-Theanine to further enhance cognitive restoration during rest cycles."
      ]
    },
    {
      id: 'omega-3-cognitive-synergy',
      title: 'The Synergistic Effect of DHA and EPA on Cognitive Resilience',
      excerpt: 'A clinical overview of how high-potency Omega-3 protocols support neuroplasticity and long-term brain health.',
      category: 'CLINICAL',
      imageUrl: getImage('blog_2'),
      imageHint: 'microscope cells',
      readTime: '8 MIN READ',
      authorName: 'Brooke Aaron, MS, RDN',
      authorTitle: 'Clinical Nutrition Director',
      date: 'NOV 02, 2024',
      published: true,
      content: [
        "The brain is roughly 60% fat, making the quality of lipid intake a primary driver of cognitive function. EPA and DHA, the long-chain omega-3 fatty acids, are essential building blocks for neuronal membranes.",
        "Clinical trials conducted at our Miami facility suggest that a 3:2 ratio of EPA to DHA provides the optimal balance for reducing neuro-inflammation while simultaneously supporting synaptic plasticity.",
        "Patients utilizing the Pharmlogics Omega-3 protocol reported a 15% increase in cognitive processing speed over a 90-day cycle, verified via standard neurological performance audits."
      ]
    },
    {
      id: 'mitochondrial-optimization-protocol',
      title: 'Optimizing Mitochondrial Output through Targeted Protocols',
      excerpt: 'Engineering cellular energy at the source. How micronutrient pairing influences ATP production and systemic vitality.',
      category: 'OPTIMIZATION',
      imageUrl: getImage('blog_3'),
      imageHint: 'molecular model',
      readTime: '5 MIN READ',
      authorName: 'Dr. Elena Thorne',
      authorTitle: 'Lead Molecular Biologist',
      date: 'DEC 15, 2024',
      published: true,
      content: [
        "Mitochondria are the powerhouses of our biology, yet they are often the first nodes to experience oxidative stress. Optimization requires a two-pronged approach: fueling the Krebs cycle and neutralizing free radical overflow.",
        "Our optimization protocol leverages a synergistic stack of CoQ10 and PQQ to support mitochondrial biogenesis. This process encourages the growth of new energy centers within the cell, effectively 'upgrading' your biological hardware.",
        "This research forms the foundation of our upcoming Vitality Series, designed for high-performers operating in high-demand physiological environments."
      ]
    }
  ];

  insights.forEach(insight => {
    const ref = doc(db, 'insights', insight.id);
    batch.set(ref, { ...insight, updatedAt: new Date().toISOString() }, { merge: true });
  });

  // 4. Initialize FAQs
  const faqRef = doc(db, 'pages', 'faqs');
  batch.set(faqRef, {
    id: 'faqs',
    title: 'Frequently Asked Questions',
    updatedAt: new Date().toISOString(),
    content: {
      seo: {
        title: "Help and FAQs",
        description: "Answers to common questions about Pharmlogics products, shipping, and scientific protocols."
      },
      sections: [
        {
          id: "general",
          title: "General Questions",
          questions: [
            { q: "Are Pharmlogics products vegan?", a: "Yes, our core formulas are 100% vegan." },
            { q: "Do they contain sugar?", a: "We avoid artificial sweeteners." }
          ]
        }
      ]
    }
  }, { merge: true });

  // 5. Initialize Store Settings
  const settingsRef = doc(db, 'settings', 'store');
  batch.set(settingsRef, {
    storeName: 'Pharmlogics Healthcare',
    taxRate: 8.0,
    standardShippingRate: 5.0,
    currencyCode: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 50.0,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return batch.commit();
}
