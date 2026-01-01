
import type { Group, User, Transaction, Auction, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format, addMonths, setDate, addDays, parseISO, lastDayOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
};

const IVA = 1.21;

const calculateCuotaPromedio = (capital: number, plazo: number): number => {
    const alicuotaPura = capital / plazo;
    const gastosAdm = (alicuotaPura * 0.10) * IVA;
    const seguroVidaPromedio = (capital * 0.0009) / 2; // Rough average
    const derechoSuscripcionPromedio = ((capital * 0.03) * IVA) / plazo;
    return alicuotaPura + gastosAdm + seguroVidaPromedio + derechoSuscripcionPromedio;
}

export const initialGroups: Group[] = [
    { id: "ID-20240115-9998", capital: 15000, plazo: 48, cuotaPromedio: 345, membersCount: 96, totalMembers: 96, status: "Activo", monthsCompleted: 23, userIsMember: true, userIsAwarded: false, activationDate: '2024-01-15T12:00:00Z' },
    { id: "ID-20230720-9999", capital: 15000, plazo: 36, cuotaPromedio: 455, membersCount: 72, totalMembers: 72, status: "Cerrado", monthsCompleted: 36, userIsMember: true, userIsAwarded: true, activationDate: '2023-07-20T12:00:00Z' },
    { id: "ID-20240510-8888", capital: 20000, plazo: 60, cuotaPromedio: calculateCuotaPromedio(20000, 60), membersCount: 120, totalMembers: 120, status: "Activo", monthsCompleted: 1, userIsMember: true, userIsAwarded: false, activationDate: '2024-05-10T12:00:00Z' },
    { id: "ID-20231101-7777", capital: 10000, plazo: 24, cuotaPromedio: calculateCuotaPromedio(10000, 24), membersCount: 48, totalMembers: 48, status: "Subastado", monthsCompleted: 19, userIsMember: true, userIsAwarded: false, activationDate: '2023-11-01T12:00:00Z' },
    { id: "ID-20240801-1024", capital: 10000, plazo: 24, cuotaPromedio: calculateCuotaPromedio(10000, 24), membersCount: 27, totalMembers: 48, status: "Abierto", userIsMember: true, userIsAwarded: false },


    // Grupos Abiertos (Nuevos y variados)
    { id: "ID-20240801-5012", capital: 5000, plazo: 12, cuotaPromedio: calculateCuotaPromedio(5000, 12), membersCount: 5, totalMembers: 24, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-5024", capital: 5000, plazo: 24, cuotaPromedio: calculateCuotaPromedio(5000, 24), membersCount: 12, totalMembers: 48, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-1012", capital: 10000, plazo: 12, cuotaPromedio: calculateCuotaPromedio(10000, 12), membersCount: 2, totalMembers: 24, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-1036", capital: 10000, plazo: 36, cuotaPromedio: calculateCuotaPromedio(10000, 36), membersCount: 10, totalMembers: 72, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-1524", capital: 15000, plazo: 24, cuotaPromedio: calculateCuotaPromedio(15000, 24), membersCount: 40, totalMembers: 48, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-1536", capital: 15000, plazo: 36, cuotaPromedio: calculateCuotaPromedio(15000, 36), membersCount: 30, totalMembers: 72, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-1548", capital: 15000, plazo: 48, cuotaPromedio: calculateCuotaPromedio(15000, 48), membersCount: 15, totalMembers: 96, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2036", capital: 20000, plazo: 36, cuotaPromedio: calculateCuotaPromedio(20000, 36), membersCount: 60, totalMembers: 72, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2048", capital: 20000, plazo: 48, cuotaPromedio: calculateCuotaPromedio(20000, 48), membersCount: 80, totalMembers: 96, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2060", capital: 20000, plazo: 60, cuotaPromedio: calculateCuotaPromedio(20000, 60), membersCount: 25, totalMembers: 120, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2548", capital: 25000, plazo: 48, cuotaPromedio: calculateCuotaPromedio(25000, 48), membersCount: 90, totalMembers: 96, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2560", capital: 25000, plazo: 60, cuotaPromedio: calculateCuotaPromedio(25000, 60), membersCount: 110, totalMembers: 120, status: "Abierto", userIsMember: false, userIsAwarded: false },
    { id: "ID-20240801-2572", capital: 25000, plazo: 72, cuotaPromedio: calculateCuotaPromedio(25000, 72), membersCount: 40, totalMembers: 144, status: "Abierto", userIsMember: false, userIsAwarded: false },
];

export const transactions: Transaction[] = [
    { id: "txn-1", date: "2024-07-15", type: "Depósito", description: "Transferencia bancaria", amount: 1000, status: "Completado" },
    { id: "txn-2", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo ID-20240115-9998, cuota 5/48", amount: -380, status: "Completado" },
    { id: "txn-3", date: "2024-07-10", type: "Pago de Cuota", description: "Grupo ID-20230720-9999, cuota 12/36", amount: -455, status: "Completado" },
    { id: "txn-4", date: "2024-06-25", type: "Liquidación", description: "Adjudicación ID-20240115-9998", amount: 15000, status: "Completado" },
    { id: "txn-5", date: "2024-6-15", type: "Retiro", description: "Retiro a cuenta bancaria", amount: -2000, status: "Completado" },
];

const getFutureDate = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export let auctions: Omit<Auction, 'precioBase'>[] = [
    { id: "auc-1", groupId: "ID-20240210-1138", orderNumber: 15, capital: 30000, plazo: 60, cuotasPagadas: 15, highestBid: 7520, endDate: getFutureDate(48), numberOfBids: 1 },
    { id: "auc-2", groupId: "ID-20240305-4815", orderNumber: 42, capital: 15000, plazo: 36, cuotasPagadas: 20, highestBid: 4166.67, endDate: getFutureDate(24), numberOfBids: 0, isPostAdjudicacion: true },
    { id: "auc-3", groupId: "ID-20231101-7777", orderNumber: 23, capital: 10000, plazo: 24, cuotasPagadas: 19, highestBid: 7800, endDate: getFutureDate(72), numberOfBids: 5 },
];

export const generateInstallments = (capital: number, plazo: number, activationDate: string): Installment[] => {
    const IVA = 1.21;
    const alicuotaPura = capital / plazo;
    const gastosAdm = (alicuotaPura * 0.10) * IVA; // 10% + IVA
    const totalSuscripcion = (capital * 0.03) * IVA; // 3% + IVA
    const mesesFinanciacionSuscripcion = Math.floor(plazo * 0.20);
    const cuotaSuscripcion = mesesFinanciacionSuscripcion > 0 ? totalSuscripcion / mesesFinanciacionSuscripcion : 0;
    
    const startDate = parseISO(activationDate);

    return Array.from({ length: plazo }, (_, i) => {
        const saldoCapital = capital - (alicuotaPura * i);
        const seguroVida = saldoCapital * 0.0009; // 0.09% del saldo de capital
        const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
        const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;
        
        let dueDate = addMonths(startDate, i + 1);

        // Ensure due date is the same day of the month as activation, or last day if not possible
        const activationDay = startDate.getDate();
        const lastDayOfNextMonth = lastDayOfMonth(dueDate).getDate();
        if (activationDay > lastDayOfNextMonth) {
            dueDate = setDate(dueDate, lastDayOfNextMonth);
        } else {
            dueDate = setDate(dueDate, activationDay);
        }


        return {
            id: `cuota-${i + 1}`,
            number: i + 1,
            dueDate: dueDate.toISOString(),
            status: 'Futuro',
            total: totalCuota,
            breakdown: {
                alicuotaPura: alicuotaPura,
                gastosAdm: gastosAdm,
                seguroVida: seguroVida,
                derechoSuscripcion: i < mesesFinanciacionSuscripcion ? derechoSuscripcion : undefined,
            },
        }
    });
};

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


