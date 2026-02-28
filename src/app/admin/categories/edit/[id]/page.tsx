
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { Loader2 } from 'lucide-react';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryRef = useMemoFirebase(() => doc(db, 'categories', resolvedParams.id), [db, resolvedParams.id]);
  const { data: category, isLoading: isFetching } = useDoc(categoryRef);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-20" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Classification Data...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Taxonomy node not found.</p>
      </div>
    );
  }

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    const categoryData = {
      ...values,
      updatedAt: new Date().toISOString(),
    };

    updateDocumentNonBlocking(categoryRef, categoryData);
    toast({ title: "Node Updated", description: `${values.name} taxonomy has been synchronized.` });
    router.push('/admin/categories');
  };

  return (
    <CategoryForm 
      title={`Edit ${category.name}`} 
      initialData={category} 
      onSubmit={onSubmit} 
      isLoading={isSubmitting} 
    />
  );
}
