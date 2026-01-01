

'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, generateInstallments } from '@/lib/data';
import type { Group } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { parseISO, differenceInHours, isBefore } from 'date-fns';

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

const MAX_CAPITAL = 100000;

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
                        return !isPaid && isBefore(dueDate, today);
                    });
                    
                    if (overdueInstallments.length >= 2) {
                        // We check the second overdue installment to see if 72 hours have passed
                        const secondOverdueDate = parseISO(overdueInstallments[1].dueDate);
                        const hoursSinceOverdue = differenceInHours(today, secondOverdueDate);
                        
                        if (hoursSinceOverdue > 72) {
                             // Check if status is not already 'Subastado' to avoid multiple toasts
                            if (group.status !== 'Subastado') {
                                return { ...group, status: 'Subastado' as const };
                            }
                        }
                    }
                }
                return group;
            });

            // Only update state if there are actual changes
            if (JSON.stringify(groupsToUpdate) !== JSON.stringify(currentGroups)) {
                return groupsToUpdate;
            }

            return currentGroups;
        });
    };

    const timer = setInterval(checkOverdue, 1000 * 60 * 60); // Check every hour
    checkOverdue(); // Initial check

    return () => clearInterval(timer);
}, [groups]);



  // Effect to show toast when a group is auctioned
  useEffect(() => {
    const prevGroups = prevGroupsRef.current;
    groups.forEach(currentGroup => {
        const prevGroup = prevGroups.find(p => p.id === currentGroup.id);
        if (prevGroup && prevGroup.userIsMember && currentGroup.userIsMember) {
            if (prevGroup.status === 'Activo' && currentGroup.status === 'Subastado') {
                toast({
                    variant: "destructive",
                    title: "Plan en Subasta Forzosa",
                    description: `Tu plan ${currentGroup.id} ha sido puesto en subasta por tener 2 o más cuotas vencidas.`,
                });
            }
        }
    });
    
    prevGroupsRef.current = groups;
  }, [groups]);
  
    // Effect to simulate a sold auction and show toast
    useEffect(() => {
        const soldAuctionSimulator = setTimeout(() => {
            setGroups(currentGroups => {
                const groupToSellId = 'ID-20231101-7777';
                const groupExistedAndWasAuctioned = currentGroups.some(g => g.id === groupToSellId && g.userIsMember && g.status === 'Subastado');

                if (groupExistedAndWasAuctioned) {
                    return currentGroups.map(g => g.id === groupToSellId ? { ...g, userIsMember: false } : g);
                }
                return currentGroups;
            });
        }, 15000); // Simulate selling after 15 seconds

        return () => clearTimeout(soldAuctionSimulator);
    }, []);

    useEffect(() => {
        const prevGroups = prevGroupsRef.current;
        groups.forEach(currentGroup => {
            const prevGroup = prevGroups.find(p => p.id === currentGroup.id);
            if (prevGroup && prevGroup.userIsMember && !currentGroup.userIsMember && prevGroup.status === 'Subastado') {
                toast({
                    title: "¡Subasta Finalizada!",
                    description: `Tu plan ${currentGroup.id} ha sido vendido con éxito en el mercado secundario.`,
                });
            }
        });
        prevGroupsRef.current = groups;
    }, [groups]);


  const joinGroup = useCallback((groupId: string) => {
    let joinedGroup: Group | null = null;

    setGroups(currentGroups => {
        const groupToJoin = currentGroups.find(g => g.id === groupId);
        if (!groupToJoin) return currentGroups;

        const subscribedCapital = currentGroups
            .filter(g => g.userIsMember && (g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente'))
            .reduce((acc, g) => acc + g.capital, 0);

        if (subscribedCapital + groupToJoin.capital > MAX_CAPITAL) {
            toast({
                variant: "destructive",
                title: "Límite de Capital Excedido",
                description: `No puedes unirte. Con este grupo, tu capital suscrito excedería el límite de ${formatCurrency(MAX_CAPITAL)}. Solicita un aumento a la administración.`,
            });
            return currentGroups;
        }
        
      let newGroups = [...currentGroups];
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        return currentGroups; // Group not found
      }

      const updatedGroup = { ...newGroups[groupIndex] };
      
      if (updatedGroup.status !== 'Abierto' || updatedGroup.userIsMember) {
        return currentGroups; // Cannot join
      }
      
      updatedGroup.membersCount++;
      updatedGroup.userIsMember = true;
      
      if (updatedGroup.membersCount === updatedGroup.totalMembers) {
        updatedGroup.status = 'Pendiente';
        const newGeneratedGroup = generateNewGroup(updatedGroup);
        if (!newGroups.some(g => g.id === newGeneratedGroup.id)) {
            newGroups.push(newGeneratedGroup);
        }
      }
      
      newGroups[groupIndex] = updatedGroup;
      joinedGroup = updatedGroup;
      
      return newGroups;
    });

    if (joinedGroup) {
        lastJoinedGroupRef.current = joinedGroup;
    }
  }, [groups]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}
