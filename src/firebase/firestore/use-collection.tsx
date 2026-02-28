
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedTargetRefOrQuery);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // We use a simple ref to track the identity of the query object.
  // Since queries are memoized with useMemoFirebase, this is safe.
  const lastQueryRef = useRef<any>(null);

  // Derive loading state: if we have a new query object, we are loading.
  const isNewQuery = memoizedTargetRefOrQuery !== lastQueryRef.current;
  const effectiveIsLoading = isNewQuery ? !!memoizedTargetRefOrQuery : isLoading;
  const effectiveData = isNewQuery ? null : data;

  useEffect(() => {
    lastQueryRef.current = memoizedTargetRefOrQuery;

    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Only wrap genuine permission-denied errors.
        // Other errors (e.g., failed-precondition for missing indexes) should
        // propagate with their original message so the root cause is visible.
        if (error.code === 'permission-denied') {
          // Safe path resolution for error reporting
          let path = 'query';
          if ((memoizedTargetRefOrQuery as any).path) {
            path = (memoizedTargetRefOrQuery as any).path;
          } else if ((memoizedTargetRefOrQuery as any)._query?.path?.segments) {
            path = (memoizedTargetRefOrQuery as any)._query.path.segments.join('/');
          }

          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          });
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
          // Surface the original error (e.g. missing index, quota exceeded).
          console.error('[Firestore] Collection listener error:', error.code, error.message);
          setError(error);
        }
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }

  return { data: effectiveData, isLoading: effectiveIsLoading, error };
}
