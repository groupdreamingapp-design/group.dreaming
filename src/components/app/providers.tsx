
'use client';

import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { initialGroups, calculateCuotaPromedio, generateInstallments } from '@/lib/data';
import type { Group, GroupTemplate, GroupStatus } from '@/lib/types';
import { GroupsContext } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { groupTemplates } from '@/lib/group-templates';
import { format, differenceInMonths, parseISO, addHours, isBefore } from 'date-fns';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, setDoc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
import { useMemo } from 'react';

let groupSequence: Record<string, number> = {};

function generateNewGroup(template: GroupTemplate): Group {
  const today = new Date();
  const datePart = format(today, 'yyyyMMdd');

  const sequenceKey = `global-${datePart}`;
  // Reset sequence logic is handled by the key change: new key = new counter starting at 1.
  groupSequence[sequenceKey] = (groupSequence[sequenceKey] || 0) + 1;

  if (groupSequence[sequenceKey] > 9999) {
    throw new Error("Daily global group limit reached.");
  }

  const sequencePart = String(groupSequence[sequenceKey]).padStart(4, '0');

  const newId = `ID-${datePart}-${sequencePart}`;

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
  const { user } = useUser();
  // Use Firestore collection
  const { data: groupsData, isLoading: loading } = useCollection<Group>('groups');

  // Map raw data to include userIsMember based on the 'members' array in Firestore
  const groups = useMemo(() => {
    if (!groupsData) return [];
    return groupsData.map((g: any) => ({
      ...g,
      userIsMember: user && g.members ? g.members.includes(user.uid) : false,
    }));
  }, [groupsData, user]);

  const [advancedInstallments, setAdvancedInstallments] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Temporary: Auto-promote specific user to admin
  useEffect(() => {
    if (user?.uid === 'GcGwSGkvwQZG6m2HK8dZw6uNKU52') {
      const promoteToAdmin = async () => {
        try {
          const adminRef = doc(db, 'roles_admin', user.uid);
          await setDoc(adminRef, {
            createdAt: new Date().toISOString(),
            createdBy: 'system_bootstrap'
          });
          console.log("User promoted to admin automatically");
        } catch (e) {
          console.error("Error promoting user:", e);
        }
      };
      promoteToAdmin();
    }
  }, [user]);

  const joinGroup = useCallback(async (groupId: string, silent: boolean = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para unirte a un grupo.",
        variant: "destructive"
      });
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await transaction.get(groupRef);

        if (!groupDoc.exists()) {
          throw "El grupo no existe.";
        }

        const data = groupDoc.data();
        const currentMembers = data.members || [];

        if (currentMembers.includes(user.uid)) {
          return; // Already member
        }

        const newCount = (data.membersCount || 0) + 1;

        // 1. Update Group Main Doc
        transaction.update(groupRef, {
          membersCount: newCount,
          members: arrayUnion(user.uid)
        });

        // 2. Create Member Sub-document with Order Number and initial payment status
        const memberRef = doc(db, 'groups', groupId, 'members', user.uid);
        transaction.set(memberRef, {
          orderNumber: newCount,
          joinedAt: new Date().toISOString(),
          status: 'Activo',
          subscriptionPaid: true, // Mark subscription as paid
          installmentsPaid: 1 // Assuming adhesion pays quota #1
        });
      });

      if (!silent) {
        toast({
          title: "¡Bienvenido al Grupo!",
          description: `Te has unido exitosamente. Tu N° de Orden es el asignado.`,
        });
      }

    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "No se pudo unir al grupo.",
        variant: "destructive"
      });
    }
  }, [toast, user]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        membersCount: increment(-1),
        members: arrayRemove(user.uid)
      });
      toast({
        title: "Baja Exitosa",
        description: `Te has dado de baja del grupo ${groupId}.`,
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "No se pudo dar de baja.",
        variant: "destructive"
      });
    }
  }, [toast, user]);

  const resetGroupMembers = useCallback(async (groupId: string) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        membersCount: 0,
        members: [] // Clean the array
      });
      toast({
        title: "Grupo Reseteado",
        description: `Se han eliminado todos los miembros del grupo ${groupId}.`,
      });
    } catch (error) {
      console.error("Error resetting group:", error);
      toast({
        title: "Error",
        description: "No se pudo resetear el grupo.",
        variant: "destructive"
      });
    }
  }, [toast]);


  const auctionGroup = useCallback(async (groupId: string) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        status: 'Subastado',
        auctionStartDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating group:", error);
    }
  }, []);

  const acceptAward = useCallback(async (groupId: string) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, { userAwardStatus: 'Adjudicado - Pendiente Garantías' });
      toast({
        title: "¡Adjudicación Aceptada!",
        description: `Por favor, procede a presentar las garantías requeridas.`,
        className: 'bg-green-100 border-green-500 text-green-700'
      });
    } catch (error) {
      console.error("Error accepting award:", error);
    }
  }, [toast]);

  const approveAward = useCallback(async (groupId: string) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, { userAwardStatus: 'Adjudicado - Aprobado' });
      toast({
        title: "¡Adjudicación Aprobada!",
        description: `Felicitaciones, el capital ha sido adjudicado a tu cuenta.`,
        className: 'bg-green-100 border-green-500 text-green-700'
      });
    } catch (error) {
      console.error("Error approving award:", error);
    }
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
    <GroupsContext.Provider value={{ groups, loading, joinGroup, leaveGroup, resetGroupMembers, auctionGroup, acceptAward, approveAward, advanceInstallments, advancedInstallments }}>
      {children}
    </GroupsContext.Provider>
  );
}
