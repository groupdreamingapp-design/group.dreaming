'use client';

import { GroupsProvider } from '@/hooks/use-groups';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GroupsProvider>
      {children}
    </GroupsProvider>
  );
}
