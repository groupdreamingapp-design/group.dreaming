
'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, installments as allInstallments } from '@/lib/data';
import type { Group } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { toast } from '@/hooks/use-toast';

function generateNewGroup(templateGroup: Group): Group {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const randomNumbers = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const newId = `ID-${dateString}-${randomNumbers}`;
    
    return {
      // Copy only the template properties, not the state
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
                    
                    const groupExists = newGroups.some(g => g.id === pendingGroup.id && g.status === 'Activo');
                    
                    if (groupExists) {
                         toast({
                            title: "¡Grupo Activado!",
                            description: `El grupo ${pendingGroup.id} ha completado sus validaciones y ya está activo.`,
                        });
                    }

                    return newGroups;
                });
            }, 5000); // Simulate 5 second processing time

            return () => clearTimeout(timer);
        }
    });
  }, [groups]);

  // Effect to check for overdue payments and force auction
  useEffect(() => {
    const checkOverdue = () => {
        setGroups(currentGroups => {
            let changed = false;
            const newGroups = currentGroups.map(group => {
                if (group.userIsMember && group.status === 'Activo' && !group.userIsAwarded) {
                    const today = new Date();
                    const overdueInstallments = allInstallments
                        .slice(group.monthsCompleted, group.plazo)
                        .filter(inst => {
                            const dueDate = new Date(inst.dueDate);
                            const diffTime = today.getTime() - dueDate.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            // Is overdue if due date has passed
                            return diffDays > 0;
                        });
                    
                    // The logic here is simplified: if the number of installments with a past due date
                    // is >= 2, we consider it has 2 overdue installments.
                    if (overdueInstallments.length >= 2) {
                        const secondOverdueDate = new Date(overdueInstallments[1].dueDate);
                        const diffTime = today.getTime() - secondOverdueDate.getTime();
                        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                        
                        if (diffHours > 72) {
                            changed = true;
                            toast({
                                variant: "destructive",
                                title: "Plan en Subasta Forzosa",
                                description: `Tu plan ${group.id} ha sido puesto en subasta por tener 2 o más cuotas vencidas.`,
                            });
                            return { ...group, status: 'Subastado' };
                        }
                    }
                }
                return group;
            });

            if (changed) {
                return newGroups;
            }
            return currentGroups;
        });
    };

    const timer = setTimeout(checkOverdue, 3000); // Check 3 seconds after app loads
    return () => clearTimeout(timer);
  }, []);

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
