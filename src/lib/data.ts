
import type { Group, User, Transaction, Auction, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
};

const capitalOptions = [5000, 10000, 15000, 20000, 25000];
const plazoOptions = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

const IVA = 1.21;

const generateInitialGroups = (): Group[] => {
  const groups: Group[] = [];
  let idCounter = 1;

  for (const capital of capitalOptions) {
    for (const plazo of plazoOptions) {
      // Approximate formula for cuotaPromedio based on previous data
      const alicuotaPura = capital / plazo;
      const gastosAdm = (alicuotaPura * 0.10) * IVA;
      const seguroVidaPromedio = (capital * 0.09 / 100) / 2; // Approximation of average insurance cost
      const cuotaPromedio = alicuotaPura + gastosAdm + seguroVidaPromedio;

      if (cuotaPromedio <= 1000) {
        const totalMembers = plazo * 2;
        // Use a deterministic method to set initial members to avoid hydration errors
        const membersCount = (capital + plazo) % Math.max(1, Math.floor(totalMembers * 0.5));
        groups.push({
          id: `GR-${String(idCounter++).padStart(3, '0')}`,
          capital,
          plazo,
          cuotaPromedio,
          membersCount: membersCount,
          totalMembers,
          status: "Abierto",
          userIsMember: false,
          userIsAwarded: false,
        });
      }
    }
  }

  // Add a couple of non-open groups for the user's dashboard
  groups.push({
    id: "GR-998",
    capital: 15000,
    plazo: 48,
    cuotaPromedio: 345,
    membersCount: 96,
    totalMembers: 96,
    status: "Activo",
    monthsCompleted: 12,
    userIsMember: true,
    userIsAwarded: true,
  });

   groups.push({
    id: "GR-999",
    capital: 15000,
    plazo: 36,
    cuotaPromedio: 455,
    membersCount: 72,
    totalMembers: 72,
    status: "Cerrado",
    monthsCompleted: 36,
    userIsMember: true,
    userIsAwarded: false,
  });


  return groups;
};

export const initialGroups: Group[] = generateInitialGroups();

export const transactions: Transaction[] = [
    { id: "txn-1", date: "2024-07-15", type: "Depósito", description: "Transferencia bancaria", amount: 1000, status: "Completado" },
    { id: "txn-2", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo GR-001, cuota 5/60", amount: -380, status: "Completado" },
    { id: "txn-3", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo GR-002, cuota 12/48", amount: -235, status: "Completado" },
    { id: "txn-4", date: "2024-06-25", type: "Liquidación", description: "Adjudicación GR-002", amount: 10000, status: "Completado" },
    { id: "txn-5", date: "2024-06-15", type: "Retiro", description: "Retiro a cuenta bancaria", amount: -2000, status: "Completado" },
];

export const auctions: Auction[] = [
    { id: "auc-1", groupId: "GR-007", capital: 30000, plazo: 60, cuotasPagadas: 15, precioMinimo: 7000, highestBid: 7250, endDate: "2024-07-28" },
    { id: "auc-2", groupId: "GR-008", capital: 15000, plazo: 36, cuotasPagadas: 20, precioMinimo: 6500, highestBid: 6500, endDate: "2024-07-29" },
]

// Assuming GR-001 is the context for these installments
const capital = 20000;
const plazo = 60;

const alicuotaPura = capital / plazo;
const gastosAdm = (alicuotaPura * 0.10) * IVA; // 10% + IVA
const totalSuscripcion = (capital * 0.03) * IVA; // 3% + IVA
const mesesFinanciacionSuscripcion = Math.floor(plazo * 0.20);
const cuotaSuscripcion = mesesFinanciacionSuscripcion > 0 ? totalSuscripcion / mesesFinanciacionSuscripcion : 0;

const staticAwards: Award[][] = [
    [{ type: 'sorteo', orderNumber: 23 }, { type: 'licitacion', orderNumber: 45 }],
    [{ type: 'sorteo', orderNumber: 11 }, { type: 'licitacion', orderNumber: 58 }],
    [{ type: 'sorteo', orderNumber: 7 }, { type: 'licitacion', orderNumber: 33 }],
    [{ type: 'sorteo', orderNumber: 54 }, { type: 'licitacion', orderNumber: 19 }],
    [{ type: 'sorteo', orderNumber: 42 }, { type: 'licitacion', orderNumber: 2 }]
];

export const installments: Installment[] = Array.from({ length: plazo }, (_, i) => {
    const saldoCapital = capital - (alicuotaPura * i);
    const seguroVida = saldoCapital * 0.0009; // 0.09% del saldo de capital
    const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
    const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;

    return {
        id: `cuota-${i + 1}`,
        number: i + 1,
        dueDate: `2024-${((i + 7) % 12) + 1}-10`,
        status: i < 5 ? 'Pagado' : i === 5 ? 'Pendiente' : 'Futuro',
        total: totalCuota,
        breakdown: {
            alicuotaPura: alicuotaPura,
            gastosAdm: gastosAdm,
            seguroVida: seguroVida,
            derechoSuscripcion: i < mesesFinanciacionSuscripcion ? derechoSuscripcion : undefined,
        },
        awards: i < 5 ? staticAwards[i] : undefined,
    }
});

export const generateExampleInstallments = (capital: number, plazo: number): Installment[] => {
    const alicuotaPura = capital / plazo;
    const gastosAdm = (alicuotaPura * 0.10) * IVA; // 10% + IVA
    const totalSuscripcion = (capital * 0.03) * IVA; // 3% + IVA
    const mesesFinanciacionSuscripcion = Math.floor(plazo * 0.20);
    const cuotaSuscripcion = mesesFinanciacionSuscripcion > 0 ? totalSuscripcion / mesesFinanciacionSuscripcion : 0;

    return Array.from({ length: plazo }, (_, i) => {
        const saldoCapital = capital - (alicuotaPura * i);
        const seguroVida = saldoCapital * 0.0009; // 0.09% del saldo de capital
        const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
        const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;

        return {
            id: `cuota-ex-${i + 1}`,
            number: i + 1,
            dueDate: `Mes ${i+1}`,
            status: 'Futuro',
            total: totalCuota,
            breakdown: {
                alicuotaPura,
                gastosAdm,
                seguroVida,
                derechoSuscripcion: i < mesesFinanciacionSuscripcion ? derechoSuscripcion : undefined,
            },
        };
    });
};
