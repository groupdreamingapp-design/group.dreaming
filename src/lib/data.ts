
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

export const calculateTotalFinancialCost = (capital: number, plazo: number): number => {
    if (capital === 0) return 0;
    
    // 1. Gastos Administrativos
    const totalGastosAdm = (capital * 0.10) * IVA;
    
    // 2. Derecho de Suscripción
    const totalDerechoSuscripcion = (capital * 0.03) * IVA;
    
    // 3. Seguro de Vida (sumatoria aproximada)
    const alicuotaPura = capital / plazo;
    let sumatoriaSaldos = 0;
    for (let i = 0; i < plazo; i++) {
        sumatoriaSaldos += (capital - (alicuotaPura * i));
    }
    const totalSeguroVida = sumatoriaSaldos * 0.0009;
    
    // Costo total sobre el capital
    const costoTotal = totalGastosAdm + totalDerechoSuscripcion + totalSeguroVida;
    
    // Porcentaje sobre el capital
    return (costoTotal / capital) * 100;
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

// Demo group for 20 users
generatedGroups.push({
    id: 'ID-DEMO20-0001',
    capital: 10000,
    plazo: 20,
    cuotaPromedio: calculateCuotaPromedio(10000, 20),
    membersCount: 19,
    totalMembers: 20,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: 'No Adjudicado',
    monthsCompleted: 0,
    activationDate: undefined,
    acquiredInAuction: false,
    isImmediateActivation: true,
});


for (const capital of capitalOptions) {
    for (const plazo of plazoOptions) {
        const cuotaPromedio = calculateCuotaPromedio(capital, plazo);

        if (cuotaPromedio <= 1000) {
            const sequentialNumber = String(groupCounter).padStart(4, '0');
            const newId = `ID-${dateString}-${sequentialNumber}`;
            
            const totalMembers = plazo <= 24 ? 48 : plazo <= 48 ? 96 : 144;
            const randomMembersCount = Math.floor(Math.random() * (totalMembers * 0.9));
            
            groupCounter++;

            generatedGroups.push({
                id: newId,
                capital,
                plazo,
                cuotaPromedio,
                membersCount: randomMembersCount,
                totalMembers,
                status: 'Abierto',
                userIsMember: false,
                userAwardStatus: "No Adjudicado",
                isImmediateActivation: false,
            });
        }
    }
}

// Select 3 random groups to be almost full
const openGroups = generatedGroups.filter(g => g.status === 'Abierto');
for (let i = 0; i < 3; i++) {
    if (openGroups.length > i) {
        const randomIndex = Math.floor(Math.random() * openGroups.length);
        const groupToUpdate = openGroups[randomIndex];
        if (groupToUpdate) {
          groupToUpdate.membersCount = groupToUpdate.totalMembers - 1;
          // groupToUpdate.isImmediateActivation = true; // This flag is now used differently
          // Remove it from the pool so we don't select it again
          openGroups.splice(randomIndex, 1);
        }
    }
}

// This group simulates one that was filled, had payment failures, and is now back in "Abierto" state
// with a few slots open for immediate activation.
generatedGroups.push({
    id: 'ID-20250602-1001',
    capital: 15000,
    plazo: 24,
    cuotaPromedio: calculateCuotaPromedio(15000, 24),
    membersCount: 47,
    totalMembers: 48,
    status: 'Abierto', // It's open again to fill the remaining slots
    userIsMember: false, // The current user is NOT a member so it shows in public explore
    userAwardStatus: 'No Adjudicado',
    monthsCompleted: 0,
    activationDate: undefined, // Not active yet
    isImmediateActivation: true, // Special flag for UI
});


// Simulation group for award flow, now open to join
generatedGroups.push({
    id: 'ID-20250501-AWRD',
    capital: 20000,
    plazo: 36,
    cuotaPromedio: calculateCuotaPromedio(20000, 36),
    membersCount: 65,
    totalMembers: 72,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 0,
    activationDate: undefined,
    acquiredInAuction: false,
    isImmediateActivation: false,
});

// New test group as per user request
generatedGroups.push({
    id: 'ID-20250806-TEST',
    capital: 10000,
    plazo: 24,
    cuotaPromedio: calculateCuotaPromedio(10000, 24),
    membersCount: 48,
    totalMembers: 48,
    status: 'Activo',
    userIsMember: true,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 4, // Simulate a few months have passed
    activationDate: '2025-08-06T00:00:00.000Z',
    acquiredInAuction: false,
    isImmediateActivation: false,
});

// New group for auction example
generatedGroups.push({
    id: 'ID-20250108-AUCTION',
    capital: 25000,
    plazo: 48,
    cuotaPromedio: calculateCuotaPromedio(25000, 48),
    membersCount: 96,
    totalMembers: 96,
    status: 'Subastado',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 12,
    activationDate: '2025-01-08T00:00:00.000Z',
    auctionStartDate: '2026-01-02T14:00:00.000Z',
    acquiredInAuction: false,
    isImmediateActivation: false,
});

// A closed group example
generatedGroups.push({
    id: 'ID-20230504-CLOSED',
    capital: 15000,
    plazo: 48,
    cuotaPromedio: calculateCuotaPromedio(15000, 48),
    membersCount: 48,
    totalMembers: 48,
    status: 'Cerrado',
    userIsMember: true,
    userAwardStatus: 'Adjudicado - Aprobado',
    monthsCompleted: 48,
    activationDate: '2023-05-04T00:00:00.000Z',
    acquiredInAuction: true,
});

export const initialGroups: Group[] = generatedGroups;


export const transactions: Transaction[] = [
    {
        id: 'tx-0',
        date: new Date().toISOString(),
        type: 'Depósito',
        description: 'Depósito inicial de fondos de prueba',
        amount: 50000,
        status: 'Completado'
    }
];

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
