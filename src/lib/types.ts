

import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  dni: string;
  cuit: string;
};

export type GroupStatus = "Abierto" | "Activo" | "Cerrado" | "Subastado";
export type UserAwardStatus = "No Adjudicado" | "Adjudicado - Pendiente Aceptación" | "Adjudicado - Pendiente Garantías" | "Adjudicado - Aprobado";

export type Group = {
  id: string;
  name: string;
  capital: number;
  plazo: number;
  cuotaPromedio: number;
  membersCount: number;
  totalMembers: number;
  status: GroupStatus;
  userIsMember: boolean;
  userAwardStatus: UserAwardStatus;
  imageUrl: string;
  imageHint: string;
  monthsCompleted?: number;
  activationDate?: string;
  acquiredInAuction?: boolean;
  auctionStartDate?: string;
  missedPayments?: number;
};

export type Auction = {
  id: string;
  groupId: string;
  orderNumber: number;
  capital: number;
  plazo: number;
  cuotasPagadas: number;
  highestBid: number;
  endDate: string;
  numberOfBids: number;
  isPostAdjudicacion?: boolean;
  isMine?: boolean;
  activationDate?: string;
};

export type InstallmentStatus = "Pagado" | "Pendiente" | "Vencido" | "Futuro";

export type AwardType = "sorteo" | "licitacion" | "sorteo-especial";

export type Award = {
  type: AwardType;
  orderNumber: number;
};

export type Installment = {
  id: string;
  number: number;
  dueDate: string;
  status: InstallmentStatus;
  total: number;
  breakdown: {
    alicuotaPura: number;
    gastosAdm: number;
    seguroVida: number;
    derechoSuscripcion?: number;
  };
  awards?: Award[];
};

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: NotificationType;
  icon: LucideIcon;
};

export type GroupTemplate = {
  purposeCode: string;
  name: string;
  capital: number;
  plazo: number;
  imageUrl: string;
  imageHint: string;
};
