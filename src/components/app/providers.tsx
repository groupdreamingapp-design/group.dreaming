
'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, calculateCuotaPromedio, generateInstallments } from '@/lib/data';
import type { Group, GroupTemplate, GroupStatus } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { groupTemplates } from '@/lib/group-templates';
import { format, differenceInMonths, parseISO, addHours, isBefore } from 'date-fns';

let groupSequence: Record<string, number> = {};

function generateNewGroup(template: GroupTemplate): Group {
    const today = new Date();
    const datePart = format(today, 'yyyyMMdd');

    const sequenceKey = `${template.purposeCode}-${datePart}`;
    groupSequence[sequenceKey] = (groupSequence[sequenceKey] || 0) + 1;
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
    };
}

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [loading, setLoading] = useState(true);
  const [advancedInstallments, setAdvancedInstallments] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    // This effect runs only on the client-side after hydration
    const today = new Date();
    const updatedGroups = initialGroups.map(group => {
      if (group.status === 'Activo' && group.activationDate) {
        const activationDate = parseISO(group.activationDate);
        let monthsPassed = differenceInMonths(today, activationDate);
        
        const installments = generateInstallments(group.capital, group.plazo, group.activationDate);
        
        // This is the number of installments that should have been paid by now
        const paidInstallments = monthsPassed - (group.missedPayments || 0);

        const overdueInstallments = installments.filter(inst => {
            const dueDate = parseISO(inst.dueDate);
            return isBefore(dueDate, today) && inst.number > paidInstallments;
        });

        if (overdueInstallments.length >= 2) {
            const secondOverdueDate = parseISO(overdueInstallments[1].dueDate);
            const seventyTwoHoursAgo = addHours(today, -72);
            if (isBefore(secondOverdueDate, seventyTwoHoursAgo) && !group.acquiredInAuction) {
                return { ...group, status: 'Subastado' as GroupStatus, auctionStartDate: new Date().toISOString(), monthsCompleted: monthsPassed };
            }
        }
        
        return { ...group, monthsCompleted: monthsPassed };
      }
      return group;
    });
    setGroups(updatedGroups);
    setLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  const joinGroup = useCallback((groupId: string) => {
    let joinedGroup: Group | null = null;
    let newGroupWasCreated = false;

    setGroups(currentGroups => {
        const groupIndex = currentGroups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) return currentGroups;

        const groupToJoin = currentGroups[groupIndex];
        if (groupToJoin.status !== 'Abierto' || groupToJoin.userIsMember) return currentGroups;

        const updatedGroup = { ...groupToJoin, membersCount: groupToJoin.membersCount + 1, userIsMember: true };
        joinedGroup = updatedGroup;

        const newGroups = [...currentGroups];
        newGroups[groupIndex] = updatedGroup;
        
        if (updatedGroup.membersCount === updatedGroup.totalMembers) {
            updatedGroup.status = 'Activo';
            updatedGroup.activationDate = new Date().toISOString();
            
            const template = groupTemplates.find(t => t.name === updatedGroup.name);
            if (template) {
                const newGroup = generateNewGroup(template);
                newGroups.push(newGroup);
                newGroupWasCreated = true;
            }
        }
        
        return newGroups;
    });

    // Use a timeout to ensure the toast is called after the render cycle
    setTimeout(() => {
        if (joinedGroup) {
            if (newGroupWasCreated) {
                toast({
                    title: "¡Grupo Completo y Activado!",
                    description: `¡Te has unido y el grupo ${joinedGroup.id} se ha activado! Tu primera cuota ha sido debitada.`,
                    className: 'bg-green-100 border-green-500 text-green-700'
                });
            } else {
                toast({
                    title: "¡Felicitaciones!",
                    description: `Te has unido al grupo ${joinedGroup.id}.`,
                });
            }
        }
    }, 0);
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


  return (
    <GroupsContext.Provider value={{ groups, loading, joinGroup, auctionGroup, acceptAward, approveAward, advanceInstallments, advancedInstallments }}>
      {children}
    </GroupsContext.Provider>
  );
}
