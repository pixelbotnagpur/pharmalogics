
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Root admin page that redirects to the primary dashboard view.
 */
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default admin dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Initializing Admin Workspace...</p>
      </div>
    </div>
  );
}
