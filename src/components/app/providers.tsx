
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
        if (!lastJoinedGroupRef.current.isImmediateActivation) {
             toast({
                title: "¡Felicitaciones!",
                description: `Te has unido al grupo ${lastJoinedGroupRef.current.id}.`,
            });
        }
    }
    myGroupsCountRef.current = currentMyGroups.length;
  }, [groups, toast]);

  // Effect to handle group state transitions (Activation, Absorption)
  useEffect(() => {
    const timer = setTimeout(() => {
      const toastsToShow: { title: string; description: string; className?: string }[] = [];
  
      const updatedGroups = [...groups];
      let stateChanged = false;

      // --- Logic for Pending -> Active ---
      const pendingGroups = updatedGroups.filter(g => g.status === 'Pendiente' && g.membersCount === g.totalMembers);
      pendingGroups.forEach(pendingGroup => {
        const groupIndex = updatedGroups.findIndex(g => g.id === pendingGroup.id);
        if (groupIndex !== -1) {
            updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], status: 'Activo', activationDate: new Date().toISOString() };
            stateChanged = true;
            toastsToShow.push({
                title: "¡Grupo Activado!",
                description: `El grupo ${pendingGroup.id} ha completado sus validaciones y ya está activo.`,
            });
        }
      });
  
      // --- Logic for Immediate Activation Absorption ---
      const immediateActivationGroups = updatedGroups.filter(g => g.isImmediateActivation && g.status === 'Abierto' && g.membersCount < g.totalMembers);
  
      immediateActivationGroups.forEach(priorityGroup => {
        if (processedImmediateActivationGroups.current.has(priorityGroup.id)) return;
  
        const neededMembers = priorityGroup.totalMembers - priorityGroup.membersCount;
        
        const donorGroup = updatedGroups
          .filter(g => 
              !g.isImmediateActivation &&
              g.status === 'Abierto' &&
              g.capital === priorityGroup.capital &&
              g.plazo === priorityGroup.plazo &&
              g.membersCount > 0
          )
          .sort((a, b) => b.id.localeCompare(a.id))[0];
  
        if (donorGroup && neededMembers > 0) {
          const membersToMove = Math.min(neededMembers, donorGroup.membersCount);
          let userWasMoved = false;
          
          let tempPriorityGroup: Group | undefined;
          
          const priorityGroupIndex = updatedGroups.findIndex(g => g.id === priorityGroup.id);
          const donorGroupIndex = updatedGroups.findIndex(g => g.id === donorGroup.id);

          if (priorityGroupIndex !== -1 && donorGroupIndex !== -1) {
              const currentDonorGroup = updatedGroups[donorGroupIndex];
              if (currentDonorGroup.userIsMember) {
                  userWasMoved = true;
              }

              updatedGroups[priorityGroupIndex].membersCount += membersToMove;
              if (userWasMoved) {
                  updatedGroups[priorityGroupIndex].userIsMember = true;
              }
              tempPriorityGroup = updatedGroups[priorityGroupIndex];

              updatedGroups[donorGroupIndex].membersCount -= membersToMove;
              if (userWasMoved) {
                  updatedGroups[donorGroupIndex].userIsMember = false;
              }
              
              if (tempPriorityGroup.membersCount === tempPriorityGroup.totalMembers) {
                  updatedGroups[priorityGroupIndex].status = 'Pendiente';
                  processedImmediateActivationGroups.current.add(priorityGroup.id);
                   if (userWasMoved) {
                      toastsToShow.push({
                          title: "¡Movimiento de Grupo!",
                          description: `Para acelerar la activación, fuiste transferido del grupo ${donorGroup.id.split('-').pop()} al grupo ${priorityGroup.id.split('-').pop()}.`,
                          className: 'bg-blue-100 border-blue-500 text-blue-700'
                      });
                  } else {
                      toastsToShow.push({
                        title: `¡Grupo ${priorityGroup.id} Lleno!`,
                        description: `Se absorbieron ${membersToMove} miembros. El grupo está listo para activarse.`,
                        className: 'bg-green-100 border-green-500 text-green-700'
                      });
                  }
              } else {
                   if (userWasMoved) {
                       toastsToShow.push({
                          title: "¡Movimiento de Grupo!",
                          description: `Para acelerar la activación, fuiste transferido del grupo ${donorGroup.id.split('-').pop()} al grupo de activación inmediata ${priorityGroup.id.split('-').pop()}.`,
                          className: 'bg-blue-100 border-blue-500 text-blue-700'
                      });
                  } else {
                      toastsToShow.push({
                        title: `Nuevos Miembros en ${priorityGroup.id}`,
                        description: `Se absorbieron ${membersToMove} miembros para acelerar la activación.`,
                      });
                  }
              }
              stateChanged = true;
            }
        }
      });
      
      if (stateChanged) {
        setGroups(updatedGroups);
      }
      // Show toasts after the state update
      toastsToShow.forEach(t => toast(t));
  
    }, 5000);
  
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
    let immediateActivation = false;

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
         if (updatedGroup.isImmediateActivation) {
            updatedGroup.status = 'Activo';
            updatedGroup.activationDate = new Date().toISOString();
            immediateActivation = true;
        } else {
            updatedGroup.status = 'Pendiente';
        }
        
        const newGroup = generateNewGroup(updatedGroup);
        newGroups.push(newGroup);
        newGroupWasCreated = true;
      }
      
      newGroups[groupIndex] = updatedGroup;
      joinedGroup = updatedGroup;
      
      return newGroups;
    });

    if (joinedGroup) {
        lastJoinedGroupRef.current = joinedGroup;
    }
    
    if (immediateActivation) {
        toast({
            title: "¡Activación Inmediata!",
            description: `¡Te has unido y el grupo ${joinedGroup?.id} se ha activado instantáneamente!`,
            className: 'bg-green-100 border-green-500 text-green-700'
        });
    } else if (newGroupWasCreated) {
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
