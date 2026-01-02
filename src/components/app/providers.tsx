

'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, generateInstallments } from '@/lib/data';
import type { Group } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { parseISO, differenceInHours, isBefore } from 'date-fns';

let groupCounter = 1;

function generateNewGroup(templateGroup: Group): Group {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    
    // This counter ensures unique IDs for newly created groups during the session
    const randomNumbers = String(Math.floor(Math.random() * 1000) + groupCounter++).padStart(4, '0');
    const newId = `ID-${dateString}-${randomNumbers}`;
    
    return {
      // Copy only the template properties, not the dynamic state
      id: newId,
      capital: templateGroup.capital,
      plazo: templateGroup.plazo,
      cuotaPromedio: templateGroup.cuotaPromedio,
      totalMembers: templateGroup.totalMembers,
      // Reset dynamic state for the new group
      membersCount: 0,
      status: 'Abierto',
      userIsMember: false,
      userIsAwarded: false,
      monthsCompleted: 0,
      activationDate: undefined,
      acquiredInAuction: false,
      isImmediateActivation: false,
    };
}

const MAX_CAPITAL = 100000;

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const { toast } = useToast();
  const myGroupsCountRef = useRef(groups.filter(g => g.userIsMember).length);
  const lastJoinedGroupRef = useRef<Group | null>(null);
  const prevGroupsRef = useRef<Group[]>(groups);
  const userInitiatedAuctionRef = useRef<string | null>(null);
  const processedImmediateActivationGroups = useRef<Set<string>>(new Set());


  useEffect(() => {
    const currentMyGroups = groups.filter(g => g.userIsMember);
    if (currentMyGroups.length > myGroupsCountRef.current && lastJoinedGroupRef.current) {
      toast({
        title: "¡Felicitaciones!",
        description: `Te has unido al grupo ${lastJoinedGroupRef.current.id}.`,
      });
    }
    myGroupsCountRef.current = currentMyGroups.length;
  }, [groups, toast]);

  // Effect to handle group state transitions (Activation, Absorption)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGroups(currentGroups => {
        let newGroups = [...currentGroups];
        let stateChanged = false;

        // --- Logic for Pending -> Active ---
        const pendingGroups = newGroups.filter(g => g.status === 'Pendiente' && g.membersCount === g.totalMembers);
        pendingGroups.forEach(pendingGroup => {
          newGroups = newGroups.map(g => {
            if (g.id === pendingGroup.id) {
              stateChanged = true;
              return { ...g, status: 'Activo', activationDate: new Date().toISOString() };
            }
            return g;
          });
          toast({
            title: "¡Grupo Activado!",
            description: `El grupo ${pendingGroup.id} ha completado sus validaciones y ya está activo.`,
          });
        });

        // --- Logic for Immediate Activation Absorption ---
        const immediateActivationGroups = newGroups.filter(g => g.isImmediateActivation && g.status === 'Abierto' && g.membersCount < g.totalMembers);

        immediateActivationGroups.forEach(priorityGroup => {
            if (processedImmediateActivationGroups.current.has(priorityGroup.id)) return;

            const neededMembers = priorityGroup.totalMembers - priorityGroup.membersCount;
            
            // Find the newest "donor" group that has members
            const donorGroup = newGroups
                .filter(g => 
                    !g.isImmediateActivation &&
                    g.status === 'Abierto' &&
                    g.capital === priorityGroup.capital &&
                    g.plazo === priorityGroup.plazo &&
                    g.membersCount > 0
                )
                .sort((a, b) => b.id.localeCompare(a.id))[0]; // Get the one with the latest ID

            if (donorGroup && neededMembers > 0) {
                const membersToMove = Math.min(neededMembers, donorGroup.membersCount);
                
                let tempPriorityGroup: Group | undefined;
                
                newGroups = newGroups.map(g => {
                    if (g.id === priorityGroup.id) {
                        tempPriorityGroup = { ...g, membersCount: g.membersCount + membersToMove };
                        return tempPriorityGroup;
                    }
                    if (g.id === donorGroup.id) {
                        return { ...g, membersCount: g.membersCount - membersToMove };
                    }
                    return g;
                });

                if (tempPriorityGroup) {
                    // Check if the priority group is now full
                    if (tempPriorityGroup.membersCount === tempPriorityGroup.totalMembers) {
                        newGroups = newGroups.map(g => g.id === tempPriorityGroup!.id ? { ...g, status: 'Pendiente' } : g);
                        processedImmediateActivationGroups.current.add(priorityGroup.id); // Mark as processed
                         toast({
                            title: `¡Grupo ${priorityGroup.id} Lleno!`,
                            description: `Se absorbieron ${membersToMove} miembros. El grupo está listo para activarse.`,
                            className: 'bg-green-100 border-green-500 text-green-700'
                        });
                    } else {
                         toast({
                            title: `Nuevos Miembros en ${priorityGroup.id}`,
                            description: `Se absorbieron ${membersToMove} miembros para acelerar la activación.`,
                            className: 'bg-blue-100 border-blue-500 text-blue-700'
                        });
                    }
                }
                stateChanged = true;
            }
        });

        return stateChanged ? newGroups : currentGroups;
      });
    }, 5000); // This timeout simulates processing time for activations and absorptions

    return () => clearTimeout(timer);
  }, [groups, toast]);


  // Effect to show toast when a group is auctioned
  useEffect(() => {
    const prevGroups = prevGroupsRef.current;
    groups.forEach(currentGroup => {
        const prevGroup = prevGroups.find(p => p.id === currentGroup.id);
        if (prevGroup && prevGroup.userIsMember && currentGroup.userIsMember) {
            if (prevGroup.status === 'Activo' && currentGroup.status === 'Subastado') {
                if (userInitiatedAuctionRef.current === currentGroup.id) {
                    // This was a user-initiated auction, toast is handled in the component
                    userInitiatedAuctionRef.current = null; // Reset ref
                } else {
                    // This was a forced auction
                    toast({
                        variant: "destructive",
                        title: "Plan en Subasta Forzosa",
                        description: `Tu plan ${currentGroup.id} ha sido puesto en subasta por tener 2 o más cuotas vencidas.`,
                    });
                }
            }
        }
         if (prevGroup && prevGroup.userIsMember && !currentGroup.userIsMember) {
             if (prevGroup.status === 'Activo' && currentGroup.status === 'Cerrado' && currentGroup.acquiredInAuction) {
                 toast({
                    variant: "destructive",
                    title: "Baja Forzosa del Plan",
                    description: `Tu plan ${currentGroup.id}, adquirido por subasta, fue dado de baja por incumplimiento de pago.`,
                });
             }
         }
    });
    
    prevGroupsRef.current = groups;
  }, [groups, toast]);
  

  const joinGroup = useCallback((groupId: string) => {
    let joinedGroup: Group | null = null;
    let newGroupWasCreated = false;

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
      
      if (groupIndex === -1) return currentGroups;

      const updatedGroup = { ...newGroups[groupIndex] };
      
      if (updatedGroup.status !== 'Abierto' || updatedGroup.userIsMember) return currentGroups;
      
      updatedGroup.membersCount++;
      updatedGroup.userIsMember = true;
      
      if (updatedGroup.membersCount === updatedGroup.totalMembers) {
        updatedGroup.status = 'Pendiente';
        
        // Create a new group with the same configuration only if the joined group is not an "immediate activation" one
        if (!updatedGroup.isImmediateActivation) {
            const newGroup = generateNewGroup(updatedGroup);
            newGroups.push(newGroup);
            newGroupWasCreated = true;
        }
      }
      
      newGroups[groupIndex] = updatedGroup;
      joinedGroup = updatedGroup;
      
      return newGroups;
    });

    if (joinedGroup) {
        lastJoinedGroupRef.current = joinedGroup;
    }
     if (newGroupWasCreated) {
      toast({
        title: "¡Grupo Completo!",
        description: `El grupo ${joinedGroup?.id} está lleno. Se ha creado un nuevo grupo con la misma configuración.`,
        className: 'bg-blue-100 border-blue-500 text-blue-700'
      });
    }
  }, [toast]);
  
  const auctionGroup = useCallback((groupId: string) => {
    userInitiatedAuctionRef.current = groupId;
    setGroups(currentGroups => {
      return currentGroups.map(g => 
        g.id === groupId ? { ...g, status: 'Subastado', auctionStartDate: new Date().toISOString() } : g
      );
    });
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup, auctionGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}
