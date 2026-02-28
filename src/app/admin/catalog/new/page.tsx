
'use client';

import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/admin/ProductForm';
import { useState } from 'react';
import type { Product } from '@/lib/types';

export default function NewProductPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts } = useCollection<Product>(productsQuery);

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    
    // Ensure lists are formatted correctly from strings if they haven't been already
    const formattedBenefits = typeof values.benefits === 'string' ? values.benefits.split(',').map((s: string) => s.trim()).filter(Boolean) : values.benefits;
    const formattedIngredients = typeof values.ingredients === 'string' ? values.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : values.ingredients;

    const productData = {
      ...values,
      benefits: formattedBenefits,
      ingredients: formattedIngredients,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const productsRef = collection(db, 'products');
    addDocumentNonBlocking(productsRef, productData);
    
    toast({ title: "Protocol Initialized", description: `${values.name} has been added to the catalog.` });
    router.push('/admin/catalog');
  };

  return <ProductForm title="Register New Formula" onSubmit={onSubmit} isLoading={isSubmitting} allProducts={allProducts || []} />;
}
