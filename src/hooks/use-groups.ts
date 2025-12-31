'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { initialGroups } from '@/lib/data';
import type { Group } from '@/lib/types';

interface GroupsContextType {
  groups: Group[];
  joinGroup: (groupId: string) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

function generateNewGroup(templateGroup: Group): Group {
    const newIdNumber = parseInt(templateGroup.id.split('-')[1]) + 10;
    const newId = `GR-${String(newIdNumber).padStart(3, '0')}`;
    
    return {
        ...templateGroup,
        id: newId,
        membersCount: 0,
        status: 'Abierto',
        userIsMember: false,
        userIsAwarded: false,
        monthsCompleted: 0,
    };
}

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);

  const joinGroup = useCallback((groupId: string) => {
    setGroups(currentGroups => {
      const newGroups = [...currentGroups];
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        return currentGroups;
      }

      const groupToJoin = { ...newGroups[groupIndex] };
      
      if (groupToJoin.status !== 'Abierto' || groupToJoin.userIsMember) {
        return currentGroups;
      }
      
      groupToJoin.membersCount++;
      groupToJoin.userIsMember = true;
      
      // Check if group is now full
      if (groupToJoin.membersCount === groupToJoin.totalMembers) {
        groupToJoin.status = 'Pendiente'; // Or 'Activo'
        const newGroup = generateNewGroup(groupToJoin);
        newGroups.push(newGroup);
      }
      
      newGroups[groupIndex] = groupToJoin;
      return newGroups;
    });
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}
