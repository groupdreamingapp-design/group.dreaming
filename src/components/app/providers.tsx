
'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, calculateCuotaPromedio, generateInstallments } from '@/lib/data';
import type { Group, GroupTemplate } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { groupTemplates } from '@/lib/group-templates';
import { format, differenceInMonths, parseISO, addHours, isBefore } from 'date-fns';

let groupSequence: Record<string, number> = {};

function generateNewGroup(template: GroupTemplate): Group {
    const today = new Date();
    const datePart = format(today, 'yyyyMMdd');

    const sequenceKey = `${template.purposeCode}-${datePart}`;
    groupSequence[sequenceKey] = (groupSequence[sequenceKey] || 1) + 1;
    const sequencePart = String(groupSequence[sequenceKey]).padStart(4, '0');

    const newId = `ID-${template.purposeCode}-${datePart}-${sequencePart}`;
    
    return {
      id: newId,
      name: template.name,
      capital: template.capital,
      plazo: template.plazo,
      imageUrl: template.imageUrl,
      imageHint: template.imageHint,
      cuotaPromedio: calculateCuotaPromedio(template.capital, template.plazo),
      totalMembers: template.plazo * 2,
      membersCount: 0,
      status: 'Abierto',
      userIsMember: false,
      userAwardStatus: "No Adjudicado",
      monthsCompleted: 0,
      acquiredInAuction: false,
      isImmediateActivation: false,
    };
}

const MAX_CAPITAL = 100000;

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [advancedInstallments, setAdvancedInstallments] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const myGroupsCountRef = useRef(groups.filter(g => g.userIsMember).length);
  const lastJoinedGroupRef = useRef<Group | null>(null);
  
  useEffect(() => {
    // This effect runs only on the client-side after hydration
    const today = new Date();
    const updatedGroups = initialGroups.map(group => {
      if (group.status === 'Activo' && group.activationDate) {
        const activationDate = parseISO(group.activationDate);
        let monthsPassed = differenceInMonths(today, activationDate);
        
        // Logic for "Subasta Forzosa"
        const installments = generateInstallments(group.capital, group.plazo, group.activationDate);
        const overdueInstallments = installments.filter(inst => {
            const dueDate = parseISO(inst.dueDate);
            const monthsCompletedWithMissed = Math.max(0, monthsPassed - (group.missedPayments || 0));
            return isBefore(dueDate, today) && inst.number > monthsCompletedWithMissed;
        });

        if (overdueInstallments.length >= 2) {
            const secondOverdueDate = parseISO(overdueInstallments[1].dueDate);
            const seventyTwoHoursAgo = addHours(today, -72);
            if (isBefore(secondOverdueDate, seventyTwoHoursAgo)) {
                return { ...group, status: 'Subastado', auctionStartDate: new Date().toISOString() };
            }
        }
        
        // Apply missed payments
        const monthsCompleted = Math.max(0, monthsPassed - (group.missedPayments || 0));

        return { ...group, monthsCompleted };
      }
      return group;
    });
    setGroups(updatedGroups);
  }, []); // Empty dependency array ensures this runs only once on mount

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
        
        const template = groupTemplates.find(t => t.name === updatedGroup.name);
        if (template) {
            const newGroup = generateNewGroup(template);
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
    
    if (immediateActivation) {
        toast({
            title: "¡Activación Inmediata!",
            description: `¡Te has unido y el grupo ${joinedGroup?.id} se ha activado instantáneamente! Tu primera cuota ha sido debitada.`,
            className: 'bg-green-100 border-green-500 text-green-700'
        });
    } else if (newGroupWasCreated) {
      toast({
        title: "¡Grupo Completo!",
        description: `El grupo ${joinedGroup?.id} está lleno y se activará pronto. Ya hemos creado un nuevo grupo '${joinedGroup?.name}' para que más personas puedan unirse.`,
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

  const advanceInstallments = useCallback((groupId: string, cuotasCount: number) => {
    setAdvancedInstallments(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || 0) + cuotasCount
    }));

    toast({
        title: "¡Adelanto Exitoso!",
        description: `Has adelantado ${cuotasCount} cuota(s) en el grupo ${groupId}.`,
        className: 'bg-green-100 border-green-500 text-green-700'
    });
  }, [toast]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <GroupsContext.Provider value={{ groups, joinGroup, auctionGroup, acceptAward, approveAward, advanceInstallments, advancedInstallments }}>
      {children}
    </GroupsContext.Provider>
  );
}
