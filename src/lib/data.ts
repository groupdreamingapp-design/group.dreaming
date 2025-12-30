import type { Group, User, Transaction, Auction, SavingsGoal, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
};

export const savingsGoal: SavingsGoal = {
    name: "Auto 0km",
    targetAmount: 20000,
    currentAmount: 7500,
    imageUrl: PlaceHolderImages.find(img => img.id === 'goal-car')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'goal-car')?.imageHint || 'new car',
};

export const groups: Group[] = [
  {
    id: "GR-001",
    capital: 20000,
    plazo: 60,
    cuotaPromedio: 380,
    membersCount: 55,
    totalMembers: 60,
    status: "Abierto",
    userIsMember: true,
    userIsAwarded: false,
  },
  {
    id: "GR-002",
    capital: 10000,
    plazo: 48,
    cuotaPromedio: 235,
    membersCount: 48,
    totalMembers: 48,
    status: "Activo",
    monthsCompleted: 12,
    userIsMember: true,
    userIsAwarded: true,
  },
  {
    id: "GR-003",
    capital: 50000,
    plazo: 120,
    cuotaPromedio: 460,
    membersCount: 112,
    totalMembers: 120,
    status: "Abierto",
    userIsMember: false,
  },
  {
    id: "GR-004",
    capital: 5000,
    plazo: 24,
    cuotaPromedio: 230,
    membersCount: 24,
    totalMembers: 24,
    status: "Activo",
    monthsCompleted: 22,
    userIsMember: false,
  },
  {
    id: "GR-005",
    capital: 15000,
    plazo: 36,
    cuotaPromedio: 455,
    membersCount: 36,
    totalMembers: 36,
    status: "Cerrado",
    monthsCompleted: 36,
    userIsMember: true,
  },
  {
    id: "GR-006",
    capital: 25000,
    plazo: 72,
    cuotaPromedio: 385,
    membersCount: 68,
    totalMembers: 72,
    status: "Abierto",
    userIsMember: false,
  },
];

export const transactions: Transaction[] = [
    { id: "txn-1", date: "2024-07-15", type: "Depósito", description: "Transferencia bancaria", amount: 1000, status: "Completado" },
    { id: "txn-2", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo GR-001, cuota 5/60", amount: -380, status: "Completado" },
    { id: "txn-3", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo GR-002, cuota 12/48", amount: -235, status: "Completado" },
    { id: "txn-4", date: "2024-06-25", type: "Liquidación", description: "Adjudicación GR-002", amount: 10000, status: "Completado" },
    { id: "txn-5", date: "2024-06-15", type: "Retiro", description: "Retiro a cuenta bancaria", amount: -2000, status: "Completado" },
];

export const auctions: Auction[] = [
    { id: "auc-1", groupId: "GR-007", capital: 30000, plazo: 60, cuotasPagadas: 15, precioMinimo: 7000, highestBid: 7250, endDate: "2024-07-28" },
    { id: "auc-2", groupId: "GR-008", capital: 12000, plazo: 36, cuotasPagadas: 20, precioMinimo: 6500, highestBid: 6500, endDate: "2024-07-29" },
]

export const installments: Installment[] = Array.from({ length: 60 }, (_, i) => {
    let awards: Award[] = [];
    // Pre-generate awards for the first 5 installments to have stable data
    const pregeneratedAwards = [
        [{ type: 'sorteo', orderNumber: 18 }, { type: 'licitacion', orderNumber: 42 }],
        [{ type: 'sorteo', orderNumber: 5 }, { type: 'licitacion', orderNumber: 29 }],
        [{ type: 'sorteo', orderNumber: 51 }, { type: 'licitacion', orderNumber: 11 }],
        [{ type: 'sorteo', orderNumber: 23 }, { type: 'licitacion', orderNumber: 38 }],
        [{ type: 'sorteo', orderNumber: 45 }, { type: 'licitacion', orderNumber: 9 }],
    ]
    if (i < 5) {
        awards = pregeneratedAwards[i];
    }
    return {
        id: `cuota-${i + 1}`,
        number: i + 1,
        dueDate: `2024-${((i + 7) % 12) + 1}-10`,
        status: i < 5 ? 'Pagado' : i === 5 ? 'Pendiente' : 'Futuro',
        total: 380,
        breakdown: {
            alicuotaPura: 333.33,
            gastosAdm: 33.33,
            seguroVida: 13.34
        },
        awards: awards.length > 0 ? awards : undefined,
    }
});
