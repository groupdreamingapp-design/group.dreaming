'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
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
  const myGroupsCountRef = useRef(groups.filter(g => g.userIsMember).length);
  const lastJoinedGroupRef = useRef<Group | null>(null);

  useEffect(() => {
    const currentMyGroups = groups.filter(g => g.userIsMember);
    if (currentMyGroups.length > myGroupsCountRef.current && lastJoinedGroupRef.current) {
      toast({
        title: "¡Felicitaciones!",
        description: `Te has unido al grupo ${lastJoinedGroupRef.current.id}.`,
      });
    }
    myGroupsCountRef.current = currentMyGroups.length;
  }, [groups]);

  // Effect to simulate group activation
  useEffect(() => {
    const pendingGroups = groups.filter(g => g.status === 'Pendiente');

    pendingGroups.forEach(pendingGroup => {
        // Find if this group was just made pending
        if(pendingGroup.membersCount === pendingGroup.totalMembers) {
             const timer = setTimeout(() => {
                setGroups(currentGroups => {
                    const newGroups = currentGroups.map(g => {
                        if (g.id === pendingGroup.id) {
                            return { ...g, status: 'Activo' };
                        }
                        return g;
                    });
                    return newGroups;
                });
                toast({
                    title: "¡Grupo Activado!",
                    description: `El grupo ${pendingGroup.id} ha completado sus validaciones y ya está activo.`,
                });
            }, 5000); // Simulate 5 second processing time

            return () => clearTimeout(timer);
        }
    });
  }, [groups]);

  const joinGroup = useCallback((groupId: string) => {
    let joinedGroup: Group | null = null;
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
      joinedGroup = groupToJoin;
      
      return newGroups;
    });

    if (joinedGroup) {
        lastJoinedGroupRef.current = joinedGroup;
    }
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
