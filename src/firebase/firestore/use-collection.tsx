'use client';

import { useState, useEffect, useRef } from 'react';
import {
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
  Query,
  collection
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Importamos tu DB configurada
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * Hook Inteligente para Firestore.
 * Acepta un string (ej: 'mandates') O una Query compleja.
 */
export function useCollection<T = any>(
  pathOrQuery: string | CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {

  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empieza cargando
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // Usamos useRef para detectar si la query cambió realmente y evitar bucles
  const queryRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Si no hay nada, no hacemos nada
    if (!pathOrQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let targetQuery: Query<DocumentData> | CollectionReference<DocumentData>;

    // 2. MAGIA: Si nos pasan un string, lo convertimos a Colección automáticamente
    if (typeof pathOrQuery === 'string') {
      targetQuery = collection(db, pathOrQuery);
    } else {
      targetQuery = pathOrQuery;
    }

    // 3. Suscripción a Firestore
    const unsubscribe = onSnapshot(
      targetQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        setData(results);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error en useCollection:", err);

        // Manejo de errores original de Antigravity
        const path = typeof pathOrQuery === 'string' ? pathOrQuery : 'query-compleja';
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [pathOrQuery]); // React se encarga de comparar si cambia el string

  return { data, isLoading, error };
}