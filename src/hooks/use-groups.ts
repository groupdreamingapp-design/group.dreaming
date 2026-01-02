

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { initialGroups } from '@/lib/data';
import type { Group } from '@/lib/types';

// 1. Define the shape of the context
interface GroupsContextType {
  groups: Group[];
  joinGroup: (groupId: string) => void;
  auctionGroup: (groupId: string) => void;
  acceptAward: (groupId: string) => void;
  approveAward: (groupId: string) => void;
}

// 2. Create the context with an initial undefined value
export const GroupsContext = createContext<GroupsContextType | undefined>(undefined);


// 3. Create the custom hook to consume the context
export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}
