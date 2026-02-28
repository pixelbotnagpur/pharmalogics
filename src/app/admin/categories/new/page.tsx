
'use client';

import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { useState } from 'react';

/**
 * @fileOverview NewCategoryPage - Handles the registration of new clinical taxonomy nodes.
 * Implements automated Registry ID generation (CAT-XXXXXX).
 */
export default function NewCategoryPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    
    // Taxonomy Node Registry Protocol: Generate unique CAT- ID
    const registryId = `CAT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const categoryData = {
      ...values,
      id: registryId, // Redundancy for data integrity
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const categoryRef = doc(db, 'categories', registryId);
    
    // Commit to cloud registry
    setDocumentNonBlocking(categoryRef, categoryData);
    
    toast({ 
      title: "Node Registered", 
      description: `Taxonomy node "${values.name}" has been assigned identifier ${registryId}.` 
    });
    
    router.push('/admin/categories');
  };

  return <CategoryForm title="Register New Taxonomy Node" onSubmit={onSubmit} isLoading={isSubmitting} />;
}
