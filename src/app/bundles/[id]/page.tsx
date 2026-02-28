
'use client';

import { use, useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { CartItem, Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Gallery } from '@/components/product/details/Gallery';
import { Header } from '@/components/product/details/Header';
import { PurchaseOptions } from '@/components/product/details/PurchaseOptions';
import { AddToCart } from '@/components/product/details/AddToCart';
import { StickyPurchaseBar } from '@/components/product/details/StickyBar';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { FeatureBento } from '@/components/product/details/FeatureBento';
import { ProductFaqs } from '@/components/product/details/Faqs';
import { ProductCard } from '@/components/product/ProductCard';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

// Dynamic import for Lightbox to optimize initial bundle weight
const Lightbox = dynamic(() => import('@/components/ui/lightbox').then(mod => mod.Lightbox), { ssr: false });

export default function BundleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const bundleRef = useMemoFirebase(() => doc(db, 'products', resolvedParams.id), [db, resolvedParams.id]);
  const { data: bundle, isLoading } = useDoc<Product>(bundleRef);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts } = useCollection<Product>(productsQuery);
  
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscribe'>('subscribe');
  const [frequency, setFrequency] = useState<string>("30");
  const [activeImage, setActiveImage] = useState<{ imageUrl: string; imageHint: string } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCart();
  const { toast } = useToast();

  // Derive initial image from Firestore doc to prevent flicker
  const currentImage = activeImage || (bundle ? (bundle.gallery?.[0] || { imageUrl: bundle.imageUrl, imageHint: bundle.imageHint }) : null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "-100px 0px 0px 0px" }
    );
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  const breadcrumbItems = useMemo(() => {
    if (!bundle) return [];
    return [
      { label: 'Products', href: '/products' },
      { label: 'Bundles' },
      { label: bundle.name },
    ];
  }, [bundle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Bundle Node</p>
        </div>
      </div>
    );
  }

  if (!bundle) notFound();

  const discountMultiplier = (1 - (bundle.subscriptionDiscount || 30) / 100);
  const subscriptionPrice = bundle.price * discountMultiplier;
  const currentUnitPrice = purchaseType === 'subscribe' ? subscriptionPrice : bundle.price;
  const totalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: bundle.id,
      name: bundle.name,
      price: currentUnitPrice,
      imageUrl: bundle.imageUrl,
      quantity,
      subscriptionFrequency: purchaseType === 'subscribe' ? parseInt(frequency) as (30|60|90) : undefined,
      packLabel: "Wellness Kit",
    };
    addItem(cartItem);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${bundle.name} has been added to your cart.`,
    });
  };

  const includedProducts = allProducts?.filter(p => bundle.includedItems?.includes(p.id)) || [];
  const bottomRelatedProducts = allProducts?.filter(p => !bundle.includedItems?.includes(p.id) && p.id !== bundle.id).slice(0, 4) || [];

  const galleryImages = bundle.gallery?.length > 0 
    ? bundle.gallery.map(img => img.imageUrl) 
    : [bundle.imageUrl];
    
  const currentLightboxIndex = galleryImages.findIndex(url => url === currentImage?.imageUrl) ?? 0;

  return (
    <div className="relative bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-16">
          <Gallery 
            gallery={bundle.gallery?.length > 0 ? bundle.gallery : [{ imageUrl: bundle.imageUrl, imageHint: bundle.imageHint }]} 
            activeImage={currentImage} 
            setActiveImage={setActiveImage}
            onMainImageClick={() => setIsLightboxOpen(true)}
          />

          <div className="lg:col-span-1 bg-card rounded-xl p-8 shadow-none border-0">
            <div className="flex flex-col gap-6">
              <Header 
                name={bundle.name} 
                description={bundle.description} 
                stock={bundle.stock}
              />

              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <Package className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Bundle Value</p>
                  <p className="text-sm font-light text-muted-foreground">Save significantly compared to buying individual formulas.</p>
                </div>
              </div>

              <div ref={ctaRef} className="flex flex-col gap-4">
                <PurchaseOptions
                  purchaseType={purchaseType}
                  onPurchaseTypeChange={setPurchaseType}
                  frequency={frequency}
                  onFrequencyChange={setFrequency}
                  packBasePrice={bundle.price}
                  subscriptionPrice={subscriptionPrice}
                  selectedPackLabel="COMPLETE WELLNESS KIT"
                  discountPercentage={bundle.subscriptionDiscount}
                />
              </div>

              <AddToCart 
                quantity={quantity} 
                setQuantity={setQuantity} 
                onAddToCart={handleAddToCart} 
                totalPrice={totalPrice} 
              />
              
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Key Benefits of this Routine</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(bundle.benefits || []).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                      <Sparkles className="h-4 w-4 text-accent shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-16" />

        {includedProducts.length > 0 && (
          <section className="mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-light mb-2">Curated Foundation</p>
              <h2 className="text-4xl md:text-5xl font-headline font-normal">What's Inside</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {includedProducts.map((p) => (
                <Card key={p.id} className="overflow-hidden bg-card border-none shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                    <div className="relative w-full sm:w-1/3 aspect-square bg-muted/10">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-headline">{p.name}</h3>
                         <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 font-light">{p.description}</p>
                      <div className="mt-auto pt-4 border-t border-dashed">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Key Focus:</p>
                         <p className="text-xs uppercase tracking-wider text-foreground font-medium">{p.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator className="mb-0" />

        <FeatureBento items={bundle.advantageSection?.items} />

        <ProductFaqs />

        <section className="py-12 md:py-24 border-t">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Recommendation</p>
              <h2 className="text-4xl md:text-5xl font-headline font-normal mt-2">You might like these</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bottomRelatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <StickyPurchaseBar
        isVisible={showStickyBar}
        productName={bundle.name}
        packLabel="Wellness Kit"
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        totalPrice={totalPrice}
      />

      <Lightbox
        images={galleryImages}
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        startIndex={currentLightboxIndex}
        title={bundle.name}
        altPrefix={bundle.name}
        className="product-lightbox"
      />
    </div>
  );
}
