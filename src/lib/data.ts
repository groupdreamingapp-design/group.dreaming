

import type { Group, User, Auction, Installment, GroupTemplate, Award } from './types';
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
const autoTemplate = groupTemplates.find(t => t.purposeCode === '002')!;
const emprendimientoTemplate = groupTemplates.find(t => t.purposeCode === '003')!;
const gustitoTemplate = groupTemplates.find(t => t.purposeCode === '004')!;
const familiaYAmigosTemplate = groupTemplates.find(t => t.purposeCode === '005')!;


export const initialGroups: Group[] = [
  // Grupos a los que el usuario ya pertenece
   {
    id: `ID-005-20250501-AWRD`,
    name: familiaYAmigosTemplate.name,
    capital: familiaYAmigosTemplate.capital,
    plazo: familiaYAmigosTemplate.plazo,
    imageUrl: familiaYAmigosTemplate.imageUrl,
    imageHint: familiaYAmigosTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(familiaYAmigosTemplate.capital, familiaYAmigosTemplate.plazo),
    totalMembers: familiaYAmigosTemplate.plazo * 2,
    membersCount: familiaYAmigosTemplate.plazo * 2,
    status: 'Activo',
    userIsMember: true,
    userAwardStatus: "Adjudicado - Pendiente Aceptación",
    activationDate: '2025-06-01T00:00:00.000Z',
    monthsCompleted: 0,
    acquiredInAuction: false,
    missedPayments: 0,
  },
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
    activationDate: '2024-05-04T00:00:00.000Z',
    acquiredInAuction: false,
    missedPayments: 0,
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
    activationDate: '2024-03-17T00:00:00.000Z',
    acquiredInAuction: false,
    missedPayments: 1,
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
    acquiredInAuction: false,
  },
  
  // Grupos disponibles para unirse
  {
    id: `ID-002-20240710-0002`,
    name: autoTemplate.name,
    capital: autoTemplate.capital,
    plazo: autoTemplate.plazo,
    imageUrl: autoTemplate.imageUrl,
    imageHint: autoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(autoTemplate.capital, autoTemplate.plazo),
    totalMembers: autoTemplate.plazo * 2,
    membersCount: 5,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    acquiredInAuction: false,
  },
  {
    id: `ID-001-20240801-0001`,
    name: viviendaTemplate.name,
    capital: viviendaTemplate.capital,
    plazo: viviendaTemplate.plazo,
    imageUrl: viviendaTemplate.imageUrl,
    imageHint: viviendaTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(viviendaTemplate.capital, viviendaTemplate.plazo),
    totalMembers: viviendaTemplate.plazo * 2,
    membersCount: 220,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    acquiredInAuction: false,
  },
  {
    id: `ID-003-20240805-0001`,
    name: emprendimientoTemplate.name,
    capital: emprendimientoTemplate.capital,
    plazo: emprendimientoTemplate.plazo,
    imageUrl: emprendimientoTemplate.imageUrl,
    imageHint: emprendimientoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(emprendimientoTemplate.capital, emprendimientoTemplate.plazo),
    totalMembers: emprendimientoTemplate.plazo * 2,
    membersCount: 80,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    acquiredInAuction: false,
  },
  {
    id: `ID-005-20240815-0001`,
    name: familiaYAmigosTemplate.name,
    capital: familiaYAmigosTemplate.capital,
    plazo: familiaYAmigosTemplate.plazo,
    imageUrl: familiaYAmigosTemplate.imageUrl,
    imageHint: familiaYAmigosTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(familiaYAmigosTemplate.capital, familiaYAmigosTemplate.plazo),
    totalMembers: familiaYAmigosTemplate.plazo * 2,
    membersCount: 1,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    acquiredInAuction: false,
  },
  {
    id: `ID-004-20240810-0001`,
    name: gustitoTemplate.name,
    capital: gustitoTemplate.capital,
    plazo: gustitoTemplate.plazo,
    imageUrl: gustitoTemplate.imageUrl,
    imageHint: gustitoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(gustitoTemplate.capital, gustitoTemplate.plazo),
    totalMembers: gustitoTemplate.plazo * 2,
    membersCount: 45,
    status: 'Abierto',
    userIsMember: false,
    userAwardStatus: "No Adjudicado",
    acquiredInAuction: false,
  },
  {
    id: `ID-002-20240110-0001`,
    name: autoTemplate.name,
    capital: autoTemplate.capital,
    plazo: autoTemplate.plazo,
    imageUrl: autoTemplate.imageUrl,
    imageHint: autoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(autoTemplate.capital, autoTemplate.plazo),
    totalMembers: autoTemplate.plazo * 2,
    membersCount: autoTemplate.plazo * 2,
    status: 'Subastado',
    userIsMember: false,
    userAwardStatus: 'No Adjudicado',
    activationDate: '2024-01-15T00:00:00.000Z',
    monthsCompleted: 6,
    auctionStartDate: new Date().toISOString(),
    acquiredInAuction: true,
  },
  {
    id: 'ID-20250806-TEST',
    name: autoTemplate.name,
    capital: 24000,
    plazo: 48,
    imageUrl: autoTemplate.imageUrl,
    imageHint: autoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(24000, 48),
    totalMembers: 96,
    membersCount: 96,
    status: 'Subastado',
    userIsMember: false,
    userAwardStatus: 'No Adjudicado',
    activationDate: '2023-01-15T00:00:00.000Z',
    monthsCompleted: 18,
    auctionStartDate: new Date().toISOString(),
    acquiredInAuction: false,
  },
  {
    id: 'ID-SUBASTA-EJEMPLO-001',
    name: 'Subasta de Prueba',
    capital: 15000,
    plazo: 60,
    imageUrl: emprendimientoTemplate.imageUrl,
    imageHint: emprendimientoTemplate.imageHint,
    cuotaPromedio: calculateCuotaPromedio(15000, 60),
    totalMembers: 120,
    membersCount: 120,
    status: 'Subastado',
    userIsMember: false,
    userAwardStatus: 'No Adjudicado',
    activationDate: '2023-06-01T00:00:00.000Z',
    monthsCompleted: 14,
    auctionStartDate: new Date().toISOString(),
    acquiredInAuction: false,
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

    // The first installment is paid upon joining, so we generate from the second one.
    // The second installment is due on the 10th of the month FOLLOWING the activation.
    const firstDueDate = setDate(addMonths(startDate, 1), 10);

    return Array.from({ length: plazo }, (_, i) => {
        const saldoCapital = capital - (alicuotaPura * i);
        const seguroVida = saldoCapital * 0.0009;
        const derechoSuscripcion = i < mesesFinanciacionSuscripcion ? cuotaSuscripcion : 0;
        const totalCuota = alicuotaPura + gastosAdm + seguroVida + derechoSuscripcion;
        
        let dueDate: Date;
        if (i === 0) {
            // First installment is paid on activation day.
            dueDate = startDate;
        } else {
            // Subsequent installments are on the 10th of each month.
            dueDate = setDate(addMonths(startDate, i), 10);
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

export const generateStaticAwards = (group: Group): Award[][] => {
    // Initialize a pseudo-random generator based on the group ID for consistency
    let seed = 0;
    for (let i = 0; i < group.id.length; i++) {
        seed = (seed + group.id.charCodeAt(i)) % 1000000;
    }
    const customRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const memberOrderNumbers = Array.from({ length: group.totalMembers }, (_, i) => i + 1);
    
    // Generate a consistent user order number based on group ID
    let userOrderNumberSeed = 0;
    for (let i = 0; i < group.id.length; i++) {
      userOrderNumberSeed += group.id.charCodeAt(i);
    }
    const userOrderNumber = (userOrderNumberSeed % group.totalMembers) + 1;


    // Fisher-Yates shuffle
    const shuffle = (array: number[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(customRandom() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    
    // Create a pool of potential winners and shuffle it
    let potentialWinners = shuffle([...memberOrderNumbers]);
    
    const awards: Award[][] = Array.from({ length: group.plazo }, () => []);
    
    // If the user is already awarded, remove them from the main pool and place their award
    if (group.userAwardStatus !== 'No Adjudicado' && group.id === 'ID-005-20250501-AWRD') {
        const userIndex = potentialWinners.indexOf(userOrderNumber);
        if (userIndex > -1) {
            potentialWinners.splice(userIndex, 1);
        }
        // Force the award to be in month 7 (index 6) for simulation for this specific group
        const awardMonthIndex = 6;
        
        if (!awards[awardMonthIndex].some(a => a.orderNumber === userOrderNumber)) {
           awards[awardMonthIndex].push({ type: 'sorteo', orderNumber: userOrderNumber });
        }
    } else if (group.userAwardStatus !== 'No Adjudicado') {
        const userIndex = potentialWinners.indexOf(userOrderNumber);
        if (userIndex > -1) {
            potentialWinners.splice(userIndex, 1);
        }
        // For other awarded groups, place it in month 7 (index 6)
        const awardMonthIndex = 6;
        if (!awards[awardMonthIndex].some(a => a.orderNumber === userOrderNumber)) {
           awards[awardMonthIndex].push({ type: 'sorteo', orderNumber: userOrderNumber });
        }
    }


    let winnerPool = [...potentialWinners];
    let desertedLicitaciones = 0;

    // Month 1 is for capitalization, so awards start from month 2 (index 1)
    for (let i = 1; i < group.plazo - 1; i++) {
        
        let alreadyAwardedInMonth = awards[i].map(a => a.orderNumber);
        const hasSorteo = awards[i].some(a => a.type === 'sorteo');
        const hasLicitacion = awards[i].some(a => a.type === 'licitacion');
        
        // Add Sorteo winner if not present and pool is not empty
        if (!hasSorteo && winnerPool.length > 0) {
            const winner = winnerPool.shift()!;
            if (!alreadyAwardedInMonth.includes(winner)) {
                 awards[i].push({ type: 'sorteo', orderNumber: winner });
                 alreadyAwardedInMonth.push(winner);
            } else {
                 winnerPool.push(winner); // put it back if already awarded
            }
        }

        alreadyAwardedInMonth = awards[i].map(a => a.orderNumber);
        // Add Licitacion winner if not present and pool is not empty
        if (!hasLicitacion && winnerPool.length > 0) {
            const isDeserted = customRandom() < 0.15 && desertedLicitaciones < 3; // 15% chance, max 3
            if (!isDeserted) {
                if (winnerPool.length > 0) {
                    const winnerIndex = winnerPool.findIndex(w => !alreadyAwardedInMonth.includes(w));
                    if(winnerIndex > -1){
                        const winner = winnerPool.splice(winnerIndex, 1)[0];
                        awards[i].push({ type: 'licitacion', orderNumber: winner });
                    }
                }
            } else {
                desertedLicitaciones++;
            }
        }
    }
    
    // Final month adjudication
    const lastMonthIndex = group.plazo - 1;
    winnerPool.forEach(winner => {
        awards[lastMonthIndex].push({ type: 'sorteo-especial', orderNumber: winner });
    });
    
    // Add deserted licitaciones as extra sorteos especiales in the last month
    for(let j=0; j < desertedLicitaciones; j++) {
        awards[lastMonthIndex].push({ type: 'sorteo-especial', orderNumber: 0 - (j + 1) }); // Use negative numbers for placeholder
    }
    
    return awards;
};

    
