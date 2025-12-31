'use client';

import { useState, useCallback, ReactNode } from 'react';
import { initialGroups } from '@/lib/data';
import type { Group } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { toast } from '@/hooks/use-toast';

function generateNewGroup(templateGroup: Group): Group {
    const newIdNumber = parseInt(templateGroup.id.split('-')[1]) + Math.floor(Math.random() * 10) + 1;
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
      let newGroups = [...currentGroups];
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        return currentGroups; // Group not found
      }

      const groupToJoin = { ...newGroups[groupIndex] };
      
      if (groupToJoin.status !== 'Abierto' || groupToJoin.userIsMember) {
        return currentGroups; // Cannot join
      }
      
      groupToJoin.membersCount++;
      groupToJoin.userIsMember = true;
      
      // If group is now full, change its status and create a new one.
      if (groupToJoin.membersCount === groupToJoin.totalMembers) {
        groupToJoin.status = 'Pendiente';
        const newGeneratedGroup = generateNewGroup(groupToJoin);
        // Add the new group, but first check if a group with this ID already exists
        if (!newGroups.some(g => g.id === newGeneratedGroup.id)) {
            newGroups.push(newGeneratedGroup);
        }
      }
      
      newGroups[groupIndex] = groupToJoin;
      
      toast({
        title: "¡Felicitaciones!",
        description: `Te has unido al grupo ${groupToJoin.id}.`,
      });

      return newGroups;
    });
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}


export function Providers({ children }: { children: ReactNode }) {
  return (
    <GroupsProvider>
      {children}
    </GroupsProvider>
  );
}
