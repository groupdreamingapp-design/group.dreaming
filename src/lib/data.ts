
import type { Group, User, Transaction, Auction, Installment, Award } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format, addMonths, setDate, addDays, parseISO, lastDayOfMonth, differenceInMonths, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
  dni: '30.123.456',
  cuit: '20-30123456-7',
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

const todayForId = new Date();
const year = todayForId.getFullYear();
const month = String(todayForId.getMonth() + 1).padStart(2, '0');
const day = String(todayForId.getDate()).padStart(2, '0');
const dateString = `${year}${month}${day}`;

for (const capital of capitalOptions) {
    for (const plazo of plazoOptions) {
        const cuotaPromedio = calculateCuotaPromedio(capital, plazo);

        if (cuotaPromedio <= 1000) {
            const sequentialNumber = String(groupCounter).padStart(4, '0');
            const newId = `ID-${dateString}-${sequentialNumber}`;
            
            const totalMembers = plazo <= 24 ? 48 : plazo <= 48 ? 96 : 144;
            
            // Deterministic membersCount based on the sequential number to avoid hydration errors
            const membersCount = (groupCounter % totalMembers);
            groupCounter++;


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

const activeGroupCapital = 15000;
const activeGroupPlazo = 24;
const activeActivationDate = new Date('2025-05-06T00:00:00.000Z');
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

generatedGroups.push({
    id: 'ID-20230504-9876',
    capital: 10000,
    plazo: 12,
    cuotaPromedio: calculateCuotaPromedio(10000, 12),
    membersCount: 24,
    totalMembers: 24,
    status: 'Cerrado',
    userIsMember: true,
    userIsAwarded: true, // Let's assume the user was awarded in this old plan
    monthsCompleted: 12,
    activationDate: '2023-05-04T00:00:00.000Z',
});


export const initialGroups: Group[] = generatedGroups;


export const transactions: Transaction[] = [];

const staticBaseDate = new Date('2026-01-10T12:00:00Z');


export let auctions: Omit<Auction, 'precioBase'>[] = [];

export const generateInstallments = (capital: number, plazo: number, activationDate: string): Installment[] => {
    const IVA = 1.21;
    const alicuotaPura = capital / plazo;
    const gastosAdm = (alicuotaPura * 0.10) * IVA;
    const totalSuscripcion = (capital * 0.03) * IVA;
    const mesesFinanciacionSuscripcion = Math.floor(plazo * 0.20);
    const cuotaSuscripcion = mesesFinanciacionSuscripcion > 0 ? totalSuscripcion / mesesFinanciacionSuscripcion : 0;
    
    const startDate = parseISO(activationDate);
    const activationDay = startDate.getUTCDate();

    return Array.from({ length: plazo }, (_, i) => {
        const saldoCapital = capital - (alicuotaPura * i);
        const seguroVida = saldoCapital * 0.0009;
        const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
        const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;
        
        const futureDate = addMonths(startDate, i + 1);
        const targetYear = futureDate.getUTCFullYear();
        const targetMonth = futureDate.getUTCMonth();

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
    





    

    

























    






