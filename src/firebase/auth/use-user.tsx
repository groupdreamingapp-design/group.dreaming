'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '../';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!auth) {
      setUser(undefined);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return user;
}
