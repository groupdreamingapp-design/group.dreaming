'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './config';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<
    ReturnType<typeof initializeFirebase> | undefined
  >(undefined);

  useEffect(() => {
    const fb = initializeFirebase();
    setFirebase(fb);
  }, []);

  if (!firebase) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
