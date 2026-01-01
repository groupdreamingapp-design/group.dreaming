

import type { Group, User, Transaction, Auction, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format, addMonths, setDate, addDays, parseISO, lastDayOfMonth, differenceInMonths, startOfToday } from 'date-fns';
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

const capitalOptions = [5000, 10000, 15000, 20000, 25000];
const plazoOptions = [12, 24, 36, 48, 60, 72, 84];

const generatedGroups: Group[] = [];
let groupCounter = 1;

// This date is static and will be the same on server and client
const todayForId = new Date('2026-01-01T00:00:00Z');
const year = todayForId.getFullYear();
const month = String(todayForId.getMonth() + 1).padStart(2, '0');
const day = String(todayForId.getDate()).padStart(2, '0');
const dateString = `${year}${month}${day}`;

for (const capital of capitalOptions) {
    for (const plazo of plazoOptions) {
        const cuotaPromedio = calculateCuotaPromedio(capital, plazo);

        if (cuotaPromedio <= 1000) {
            const sequentialNumber = String(groupCounter++).padStart(4, '0');
            const newId = `ID-${dateString}-${sequentialNumber}`;

            let totalMembers;
            if (plazo <= 24) totalMembers = 48;
            else if (plazo <= 48) totalMembers = 96;
            else totalMembers = 144;
            
            // Deterministic membersCount to avoid hydration errors
            const membersCount = (groupCounter % (totalMembers -1));

            generatedGroups.push({
                id: newId,
                capital,
                plazo,
                cuotaPromedio,
                membersCount,
                totalMembers,
                status: 'Abierto',
                userIsMember: false,
                userIsAwarded: false,
            });
        }
    }
}


// Add the active group that started in the past
const activeGroupCapital = 15000;
const activeGroupPlazo = 24;
// We set a fixed past date for activation
const activeActivationDate = new Date('2025-06-05T00:00:00Z'); 
// We set a fixed "today" to calculate the completed months
const today = new Date('2026-01-01T00:00:00Z');
const activeMonthsCompleted = differenceInMonths(today, activeActivationDate);


generatedGroups.push({
    id: 'ID-20250602-1001',
    capital: activeGroupCapital,
    plazo: activeGroupPlazo,
    cuotaPromedio: calculateCuotaPromedio(activeGroupCapital, activeGroupPlazo),
    membersCount: 48,
    totalMembers: 48,
    status: 'Activo',
    userIsMember: true,
    userIsAwarded: false,
    monthsCompleted: activeMonthsCompleted > 0 ? activeMonthsCompleted : 0,
    activationDate: activeActivationDate.toISOString(),
});


export const initialGroups: Group[] = generatedGroups;


export const transactions: Transaction[] = [];

// Static base date to avoid hydration errors with Date.now()
const staticBaseDate = new Date('2026-01-10T12:00:00Z').getTime();
const getFutureDate = (hours: number) => new Date(staticBaseDate + hours * 60 * 60 * 1000).toISOString();


export let auctions: Omit<Auction, 'precioBase'>[] = [
    { id: "auc-1", groupId: "ID-20240210-1138", orderNumber: 15, capital: 30000, plazo: 60, cuotasPagadas: 15, highestBid: 7520, endDate: getFutureDate(48), numberOfBids: 1 },
    { id: "auc-2", groupId: "ID-20240305-4815", orderNumber: 42, capital: 15000, plazo: 36, cuotasPagadas: 20, highestBid: 4166.67, endDate: getFutureDate(24), numberOfBids: 0, isPostAdjudicacion: true },
    { id: "auc-3", groupId: "ID-20231101-7777", orderNumber: 23, capital: 10000, plazo: 24, cuotasPagadas: 19, highestBid: 7800, endDate: getFutureDate(2), numberOfBids: 5, isMine: true },
    { id: "auc-4", groupId: "ID-20240510-8888", orderNumber: 88, capital: 20000, plazo: 60, cuotasPagadas: 5, highestBid: 0, endDate: getFutureDate(48), numberOfBids: 0 },
];

export const generateInstallments = (capital: number, plazo: number, activationDate: string): Installment[] => {
    const IVA = 1.21;
    const alicuotaPura = capital / plazo;
    const gastosAdm = (alicuotaPura * 0.10) * IVA; // 10% + IVA
    const totalSuscripcion = (capital * 0.03) * IVA; // 3% + IVA
    const mesesFinanciacionSuscripcion = Math.floor(plazo * 0.20);
    const cuotaSuscripcion = mesesFinanciacionSuscripcion > 0 ? totalSuscripcion / mesesFinanciacionSuscripcion : 0;
    
    const startDate = parseISO(activationDate);
    const activationDay = startDate.getUTCDate();

    return Array.from({ length: plazo }, (_, i) => {
        const saldoCapital = capital - (alicuotaPura * i);
        const seguroVida = saldoCapital * 0.0009; // 0.09% del saldo de capital
        const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
        const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;
        
        const targetMonthDate = addMonths(startDate, i + 1);
        
        const targetYear = targetMonthDate.getUTCFullYear();
        const targetMonth = targetMonthDate.getUTCMonth();
        
        const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
        const dayToSet = Math.min(activationDay, lastDayOfTargetMonth);

        const dueDate = new Date(Date.UTC(targetYear, targetMonth, dayToSet));

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

function generateNewGroup(templateGroup: Group): Group {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const sequentialNumber = String(groupCounter++).padStart(4, '0');
    const newId = `ID-${dateString}-${sequentialNumber}`;
    
    return {
      // Copy only the template properties, not the state
      ...templateGroup,
      id: newId,
      membersCount: 0,
      status: 'Abierto',
      userIsMember: false,
      userIsAwarded: false,
      monthsCompleted: 0,
      activationDate: undefined,
      acquiredInAuction: false,
    };
}
    





    

    




















