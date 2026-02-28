
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { InsightForm } from '@/components/admin/InsightForm';
import { Loader2 } from 'lucide-react';
import type { Insight } from '@/lib/types';

export default function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insightRef = useMemoFirebase(() => doc(db, 'insights', resolvedParams.id), [db, resolvedParams.id]);
  const { data: insight, isLoading: isFetching } = useDoc<Insight>(insightRef);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest font-bold">Synchronizing Research Node...</p>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Insight node not found in registry.</p>
      </div>
    );
  }

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    updateDocumentNonBlocking(insightRef, values);
    toast({ title: "Registry Synchronized", description: "The research node content has been updated." });
    router.push('/admin/insights');
  };

  return (
    <InsightForm 
      title={`Edit Node: ${insight.title}`} 
      initialData={insight} 
      onSubmit={onSubmit} 
      isLoading={isSubmitting} 
    />
  );
}
