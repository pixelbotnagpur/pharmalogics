
"use client";

import { use, useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import type { CartItem, Product, PackOption, Category } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

import { Gallery } from '@/components/product/details/Gallery';
import { Header } from '@/components/product/details/Header';
import { PackSelection } from '@/components/product/details/PackSelection';
import { PurchaseOptions } from '@/components/product/details/PurchaseOptions';
import { AddToCart } from '@/components/product/details/AddToCart';
import { RelatedProducts } from '@/components/product/details/RelatedProducts';
import { ProductAccordions } from '@/components/product/details/Accordions';
import { Ingredients } from '@/components/product/details/Ingredients';
import { PurchaseBadges } from '@/components/product/details/PurchaseBadges';
import { ProductFaqs } from '@/components/product/details/Faqs';
import { StickyPurchaseBar } from '@/components/product/details/StickyBar';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FeatureBento } from '@/components/product/details/FeatureBento';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

// Dynamic import for Lightbox to optimize initial load of product detail pages
const Lightbox = dynamic(() => import('@/components/ui/lightbox').then(mod => mod.Lightbox), { ssr: false });

type PurchaseType = 'onetime' | 'subscribe';

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="aspect-square w-full rounded-xl bg-muted/20" />
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="pt-8 space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-md mt-8" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const productRef = useMemoFirebase(() => doc(db, 'products', id), [db, id]);
  const { data: product, isLoading } = useDoc<Product>(productRef);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts } = useCollection<Product>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('subscribe');
  const [frequency, setFrequency] = useState<string>("30");
  const [selectedPack, setSelectedPack] = useState<PackOption | null>(null);
  const [activeImage, setActiveImage] = useState<{ imageUrl: string; imageHint: string } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const { addItem } = useCart();
  const { toast } = useToast();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const currentImage = activeImage || (product ? (product.gallery?.[0] || { imageUrl: product.imageUrl, imageHint: product.imageHint }) : null);

  useEffect(() => {
    if (product) {
      if (product.availablePacks && product.availablePacks.length > 0) {
        setSelectedPack(product.availablePacks[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { rootMargin: "-100px 0px 0px 0px" } 
    );

    const currentCtaRef = ctaRef.current;
    if (currentCtaRef) {
      observer.observe(currentCtaRef);
    }

    return () => {
      if (currentCtaRef) {
        observer.unobserve(currentCtaRef);
      }
    };
  }, []);

  const breadcrumbItems = useMemo(() => {
    if (!product) return [];
    const categoryObj = categories?.find(c => c.name === product.category);
    return [
      { label: 'Products', href: '/products' },
      { 
        label: product.category, 
        href: categoryObj ? `/products/category/${categoryObj.slug}` : undefined 
      },
      { label: product.name },
    ];
  }, [product, categories]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    notFound();
  }
  
  const discountMultiplier = (1 - (product.subscriptionDiscount || 30) / 100);
  const packBasePrice = (product.price * (selectedPack?.count || 1)) * (selectedPack?.discountMultiplier || 1);
  const subscriptionPrice = packBasePrice * discountMultiplier; 
  const currentUnitPrice = purchaseType === 'subscribe' ? subscriptionPrice : packBasePrice;
  const totalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: currentUnitPrice,
      imageUrl: product.imageUrl,
      quantity,
      subscriptionFrequency: purchaseType === 'subscribe' ? parseInt(frequency) as (30|60|90) : undefined,
      packLabel: selectedPack?.label,
    };
    addItem(cartItem);
  };

  const sideRelatedProducts = allProducts?.filter(p => p.id !== product.id).slice(0, 3) || [];
  const bottomRelatedProducts = allProducts?.filter(p => p.id !== product.id).slice(0, 4) || [];

  const galleryImages = product.gallery?.length > 0 
    ? product.gallery.map(img => img.imageUrl) 
    : [product.imageUrl];
    
  const currentLightboxIndex = galleryImages.findIndex(url => url === currentImage?.imageUrl) ?? 0;

  return (
    <div className="relative bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-16">
          
          <Gallery 
            gallery={product.gallery?.length > 0 ? product.gallery : [{ imageUrl: product.imageUrl, imageHint: product.imageHint }]} 
            activeImage={currentImage} 
            setActiveImage={setActiveImage}
            onMainImageClick={() => setIsLightboxOpen(true)}
          />

          <div className="lg:col-span-1 bg-card rounded-xl p-8 shadow-none border-0">
            <div className="flex flex-col gap-6">
              
              <Header 
                name={product.name} 
                description={product.description} 
                stock={product.stock}
                flavor={product.flavor}
              />

              <div ref={ctaRef} className="flex flex-col gap-4">
                {product.availablePacks && product.availablePacks.length > 0 && (
                  <PackSelection 
                    packs={product.availablePacks} 
                    selectedPack={selectedPack} 
                    onSelectPack={setSelectedPack} 
                  />
                )}

                <PurchaseOptions
                  purchaseType={purchaseType}
                  onPurchaseTypeChange={setPurchaseType}
                  frequency={frequency}
                  onFrequencyChange={setFrequency}
                  packBasePrice={packBasePrice}
                  subscriptionPrice={subscriptionPrice}
                  selectedPackLabel={selectedPack?.label}
                  discountPercentage={product.subscriptionDiscount}
                />
              </div>

              <AddToCart 
                quantity={quantity} 
                setQuantity={setQuantity} 
                onAddToCart={handleAddToCart} 
                totalPrice={totalPrice} 
              />

              <RelatedProducts products={sideRelatedProducts} />

              <ProductAccordions 
                detailedBenefits={product.detailedBenefits}
                usageInstructions={product.usageInstructions}
                deliveryInfo={product.deliveryInfo}
                sustainabilityInfo={product.sustainabilityInfo}
              />
              
              <Ingredients 
                featuredIngredients={product.featuredIngredients}
                fullIngredientsList={product.fullIngredientsList}
              />

              <PurchaseBadges />

            </div>
          </div>
        </div>

        <Separator className="mb-0" />

        <FeatureBento items={product.advantageSection?.items} />

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
        productName={product.name}
        packLabel={selectedPack?.label}
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
        title={product.name}
        altPrefix={product.name}
        className="product-lightbox"
      />
    </div>
  );
}
