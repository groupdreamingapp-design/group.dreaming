

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type GroupStatus = "Abierto" | "Pendiente" | "Activo" | "Cerrado" | "Subastado";

export type Group = {
  id: string;
  capital: number;
  plazo: number;
  cuotaPromedio: number;
  membersCount: number;
  totalMembers: number;
  status: GroupStatus;
  userIsMember: boolean;
  userIsAwarded?: boolean;
  monthsCompleted?: number;
  activationDate?: string;
  acquiredInAuction?: boolean;
  auctionStartDate?: string;
};

export type TransactionType = "Depósito" | "Retiro" | "Pago de Cuota" | "Licitación" | "Subasta" | "Liquidación";

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: "Completado" | "Pendiente";
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

export type AwardType = "sorteo" | "licitacion" | "sorteo-extra";

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
