
import type { Group, User, Auction, Installment, Award, GroupTemplate } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format, addMonths, setDate, addDays, parseISO, lastDayOfMonth, differenceInMonths, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { groupTemplates } from './group-templates';

export const user: User = {
  id: 'user-1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
  dni: '30.123.456',
  cuit: '20-30123456-7',
};

const IVA = 1.21;

export const calculateCuotaPromedio = (capital: number, plazo: number): number => {
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

const viviendaTemplate = groupTemplates.find(t => t.purposeCode === '001')!;
const emprendimientoTemplate = groupTemplates.find(t => t.purposeCode === '003')!;
const gustitoTemplate = groupTemplates.find(t => t.purposeCode === '004')!;

export const initialGroups: Group[] = [
  {
    id: `ID-001-20240501-0001`,
    name: viviendaTemplate.name,
    capital: viviendaTemplate.capital,
    plazo: viviendaTemplate.plazo,
    imageUrl: viviendaTemplate.imageUrl,
    imageHint: viviendaTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(viviendaTemplate.capital, viviendaTemplate.plazo),
    totalMembers: viviendaTemplate.plazo * 2,
    membersCount: viviendaTemplate.plazo * 2,
    status: 'Activo',
    userIsMember: true,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 3, // Static value
    activationDate: '2024-05-04T00:00:00.000Z', // Static date
    acquiredInAuction: false,
    isImmediateActivation: false,
  },
  {
    id: `ID-003-20240315-0001`,
    name: emprendimientoTemplate.name,
    capital: emprendimientoTemplate.capital,
    plazo: emprendimientoTemplate.plazo,
    imageUrl: emprendimientoTemplate.imageUrl,
    imageHint: emprendimientoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(emprendimientoTemplate.capital, emprendimientoTemplate.plazo),
    totalMembers: emprendimientoTemplate.plazo * 2,
    membersCount: emprendimientoTemplate.plazo * 2,
    status: 'Activo',
    userIsMember: true,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 4, // Static value (5 months passed, 1 is overdue)
    activationDate: '2024-03-17T00:00:00.000Z', // Static date
    acquiredInAuction: false,
    isImmediateActivation: false,
  },
  {
    id: `ID-004-20240701-0001`,
    name: gustitoTemplate.name,
    capital: gustitoTemplate.capital,
    plazo: gustitoTemplate.plazo,
    imageUrl: gustitoTemplate.imageUrl,
    imageHint: gustitoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(gustitoTemplate.capital, gustitoTemplate.plazo),
    totalMembers: gustitoTemplate.plazo * 2,
    membersCount: 15,
    status: 'Abierto',
    userIsMember: true,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 0,
    acquiredInAuction: false,
    isImmediateActivation: false,
  },
  {
    id: `ID-002-20240710-0002`,
    name: 'Mi Auto',
    capital: 25000,
    plazo: 84,
    imageUrl: groupTemplates.find(t => t.purposeCode === '002')?.imageUrl || '',
    imageHint: 'car keys',
    cuotaPromedio: calculateCuotaPromedio(25000, 84),
    totalMembers: 84 * 2,
    membersCount: 5,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    monthsCompleted: 0,
    acquiredInAuction: false,
    isImmediateActivation: false,
  }
];


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

    