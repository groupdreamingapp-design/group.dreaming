
import type { Group, User, Transaction, Auction, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
};

const IVA = 1.21;

const generateId = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const randomNumbers = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `ID-${dateString}-${randomNumbers}`;
};

const generateInitialGroups = (): Group[] => {
  const groups: Group[] = [
    { id: "ID-20240729-1001", capital: 5000, plazo: 12, cuotaPromedio: 458, membersCount: 10, totalMembers: 24, status: "Abierto", userIsMember: false, userIsAwarded: false, },
    { id: "ID-20240729-1002", capital: 10000, plazo: 24, cuotaPromedio: 458, membersCount: 20, totalMembers: 48, status: "Abierto", userIsMember: false, userIsAwarded: false, },
    { id: "ID-20240729-1003", capital: 15000, plazo: 36, cuotaPromedio: 458, membersCount: 30, totalMembers: 72, status: "Abierto", userIsMember: false, userIsAwarded: false, },
    { id: "ID-20240729-1004", capital: 20000, plazo: 48, cuotaPromedio: 458, membersCount: 40, totalMembers: 96, status: "Abierto", userIsMember: false, userIsAwarded: false, },
    { id: "ID-20240115-9998", capital: 15000, plazo: 48, cuotaPromedio: 345, membersCount: 96, totalMembers: 96, status: "Activo", monthsCompleted: 12, userIsMember: true, userIsAwarded: true, },
    { id: "ID-20230720-9999", capital: 15000, plazo: 36, cuotaPromedio: 455, membersCount: 72, totalMembers: 72, status: "Cerrado", monthsCompleted: 36, userIsMember: true, userIsAwarded: false, }
  ];
  return groups;
};

export let initialGroups: Group[] = generateInitialGroups();

export const transactions: Transaction[] = [
    { id: "txn-1", date: "2024-07-15", type: "Depósito", description: "Transferencia bancaria", amount: 1000, status: "Completado" },
    { id: "txn-2", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo ID-20240115-9998, cuota 5/48", amount: -380, status: "Completado" },
    { id: "txn-3", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo ID-20230720-9999, cuota 12/36", amount: -455, status: "Completado" },
    { id: "txn-4", date: "2024-06-25", type: "Liquidación", description: "Adjudicación ID-20240115-9998", amount: 15000, status: "Completado" },
    { id: "txn-5", date: "2024-06-15", type: "Retiro", description: "Retiro a cuenta bancaria", amount: -2000, status: "Completado" },
];

export const auctions: Auction[] = [
    { id: "auc-1", groupId: "ID-20240210-1138", capital: 30000, plazo: 60, cuotasPagadas: 15, precioMinimo: 7200, highestBid: 7520, endDate: "2024-07-28", numberOfBids: 1 },
    { id: "auc-2", groupId: "ID-20240305-4815", capital: 15000, plazo: 36, cuotasPagadas: 20, precioMinimo: 8100, highestBid: 8100, endDate: "2024-07-29", numberOfBids: 0 },
]

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
