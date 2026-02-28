
'use client';

import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { InsightForm } from '@/components/admin/InsightForm';
import { useState } from 'react';

/**
 * @fileOverview NewInsightPage - Handles the registration of new research abstracts.
 * Implements automated Protocol Node ID generation (INS-XXXXXX).
 */
export default function NewInsightPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    
    // Protocol Node Registry Protocol: Generate unique INS- ID
    const registryId = `INS-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const insightData = {
      ...values,
      id: registryId, // Redundancy for data integrity
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const insightRef = doc(db, 'insights', registryId);
    
    // Commit to cloud registry
    setDocumentNonBlocking(insightRef, insightData);
    
    toast({ 
      title: "Protocol Registered", 
      description: `Research node "${values.title}" has been initialized with identifier ${registryId}.` 
    });
    
    router.push('/admin/insights');
  };

  return <InsightForm title="Register Research Node" onSubmit={onSubmit} isLoading={isSubmitting} />;
}
