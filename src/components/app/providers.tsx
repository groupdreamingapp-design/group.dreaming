

'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, generateInstallments } from '@/lib/data';
import type { Group } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { toast } from '@/hooks/use-toast';
import { parseISO, differenceInHours } from 'date-fns';

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
      activationDate: undefined,
    };
}


export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const myGroupsCountRef = useRef(groups.filter(g => g.userIsMember).length);
  const lastJoinedGroupRef = useRef<Group | null>(null);
  const prevGroupsRef = useRef<Group[]>(groups);

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
        if(pendingGroup.membersCount === pendingGroup.totalMembers) {
             const timer = setTimeout(() => {
                setGroups(currentGroups => {
                    const newGroups = currentGroups.map(g => {
                        if (g.id === pendingGroup.id) {
                            return { 
                                ...g, 
                                status: 'Activo',
                                activationDate: new Date().toISOString()
                            };
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
            }, 5000); 

            return () => clearTimeout(timer);
        }
    });
  }, [groups]);

  // Effect to check for overdue payments and force auction
 useEffect(() => {
    const checkOverdue = () => {
        setGroups(currentGroups => {
            const groupsToUpdate = currentGroups.map(group => {
                if (group.userIsMember && group.status === 'Activo' && !group.userIsAwarded && group.activationDate) {
                    const today = new Date();
                    const groupInstallments = generateInstallments(group.capital, group.plazo, group.activationDate);
                    const overdueInstallments = groupInstallments.filter(inst => {
                        const isPaid = inst.number <= (group.monthsCompleted || 0);
                        const dueDate = parseISO(inst.dueDate);
                        return !isPaid && dueDate < today;
                    });
                    
                    if (overdueInstallments.length >= 2) {
                        const secondOverdueDate = parseISO(overdueInstallments[1].dueDate);
                        const hoursSinceOverdue = differenceInHours(today, secondOverdueDate);
                        
                        if (hoursSinceOverdue > 72) {
                            return { ...group, status: 'Subastado' as const };
                        }
                    }
                }
                return group;
            });
            return groupsToUpdate;
        });
    };

    const timer = setTimeout(checkOverdue, 3000);
    return () => clearTimeout(timer);
}, [groups]);


  // Effect to show toast when a group is auctioned or sold
  useEffect(() => {
    const prevGroups = prevGroupsRef.current;
    groups.forEach(currentGroup => {
        const prevGroup = prevGroups.find(p => p.id === currentGroup.id);
        if (prevGroup) {
            // Toast for forced auction
            if (prevGroup.status === 'Activo' && currentGroup.status === 'Subastado') {
                toast({
                    variant: "destructive",
                    title: "Plan en Subasta Forzosa",
                    description: `Tu plan ${currentGroup.id} ha sido puesto en subasta por tener 2 o más cuotas vencidas.`,
                });
            }
            // Toast for sold auction
            if (prevGroup.userIsMember && !currentGroup.userIsMember && prevGroup.status === 'Subastado') {
                 toast({
                    title: "¡Subasta Finalizada!",
                    description: `Tu plan ${currentGroup.id} ha sido vendido con éxito en el mercado secundario.`,
                });
            }
        }
    });
    
    prevGroupsRef.current = groups;
  }, [groups]);
  
    // Effect to simulate a sold auction
    useEffect(() => {
        const soldAuctionSimulator = setTimeout(() => {
            setGroups(currentGroups => {
                const groupToSellId = 'ID-20231101-7777';
                const groupExistedAndWasAuctioned = currentGroups.some(g => g.id === groupToSellId && g.userIsMember && g.status === 'Subastado');

                if (groupExistedAndWasAuctioned) {
                    // Just update the state, the other useEffect will handle the toast
                    return currentGroups.map(g => g.id === groupToSellId ? { ...g, userIsMember: false } : g);
                }
                return currentGroups;
            });
        }, 15000); // Simulate selling after 15 seconds

        return () => clearTimeout(soldAuctionSimulator);
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
      
      if (groupToJoin.membersCount === groupToJoin.totalMembers) {
        groupToJoin.status = 'Pendiente';
        const newGeneratedGroup = generateNewGroup(groupToJoin);
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
