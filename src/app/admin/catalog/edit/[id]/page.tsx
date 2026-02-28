
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productRef = useMemoFirebase(() => doc(db, 'products', resolvedParams.id), [db, resolvedParams.id]);
  const { data: product, isLoading: isFetching } = useDoc(productRef);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts } = useCollection<Product>(productsQuery);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-20" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Clinical Data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Formula entity not found in active catalog.</p>
      </div>
    );
  }

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    const productData = {
      ...values,
      benefits: typeof values.benefits === 'string' ? values.benefits.split(',').map((s: string) => s.trim()).filter(Boolean) : values.benefits,
      ingredients: typeof values.ingredients === 'string' ? values.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : values.ingredients,
      updatedAt: new Date().toISOString(),
    };

    updateDocumentNonBlocking(productRef, productData);
    toast({ title: "Protocol Updated", description: `${values.name} data has been synchronized.` });
    router.push('/admin/catalog');
  };

  return (
    <ProductForm 
      title={`Edit ${product.name}`} 
      initialData={product} 
      onSubmit={onSubmit} 
      isLoading={isSubmitting} 
      allProducts={allProducts || []}
    />
  );
}
