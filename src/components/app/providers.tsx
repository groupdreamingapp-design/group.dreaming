

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
      userAwardStatus: "No Adjudicado",
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
    setGroups(currentGroups => {
      return currentGroups.map(g => 
        g.id === groupId ? { ...g, status: 'Subastado', auctionStartDate: new Date().toISOString() } : g
      );
    });
  }, []);

  const acceptAward = useCallback((groupId: string) => {
    setGroups(currentGroups => {
      return currentGroups.map(g => 
        (g.id === groupId && g.userAwardStatus === 'Adjudicado - Pendiente Aceptación') 
          ? { ...g, userAwardStatus: 'Adjudicado - Pendiente Garantías' } 
          : g
      );
    });
    toast({
        title: "¡Adjudicación Aceptada!",
        description: `Por favor, procede a presentar las garantías requeridas.`,
        className: 'bg-green-100 border-green-500 text-green-700'
    });
  }, [toast]);

  const approveAward = useCallback((groupId: string) => {
    setGroups(currentGroups => {
      return currentGroups.map(g => 
        (g.id === groupId && g.userAwardStatus === 'Adjudicado - Pendiente Garantías') 
          ? { ...g, userAwardStatus: 'Adjudicado - Aprobado' } 
          : g
      );
    });
    toast({
        title: "¡Adjudicación Aprobada!",
        description: `Felicitaciones, el capital ha sido adjudicado a tu cuenta.`,
        className: 'bg-green-100 border-green-500 text-green-700'
    });
  }, [toast]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup, auctionGroup, acceptAward, approveAward }}>
      {children}
    </GroupsContext.Provider>
  );
}
