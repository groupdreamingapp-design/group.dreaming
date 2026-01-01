
'use client';

import type { Group, Installment, Award } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, Clock, Users2, Calendar, Gavel, HandCoins, Ticket, Info, Trophy, FileX2, TrendingUp, Hand, Scale, CalendarCheck, Gift, Check, X, Award as AwardIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useGroups } from '@/hooks/use-groups';
import { generateInstallments, generateExampleInstallments } from '@/lib/data';
import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { addDays, parseISO, format, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type GroupDetailClientProps = {
    groupId: string;
};

const generateStaticAwards = (group: Group): Award[][] => {
    let seed = 0;
    for (let i = 0; i < group.id.length; i++) {
        seed = (seed + group.id.charCodeAt(i)) % 1000000;
    }
    const customRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const memberOrderNumbers = Array.from({ length: group.totalMembers }, (_, i) => i + 1);
    const userOrderNumber = 42; 

    const shuffle = (array: number[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(customRandom() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    
    let potentialWinners = [...memberOrderNumbers];
    
    if (group.userIsAwarded || group.status === 'Subastado') {
        const userIndex = potentialWinners.indexOf(userOrderNumber);
        if (userIndex > -1) {
            potentialWinners.splice(userIndex, 1);
        }
    }

    potentialWinners = shuffle(potentialWinners);
    
    if (group.userIsAwarded) {
        const awardsPerMonth = 2;
        const awardMonthIndex = Math.floor(group.plazo * 0.85); // Awarded in the last part of the plan for the demo
        const insertPosition = awardMonthIndex * awardsPerMonth;
        
        potentialWinners.splice(insertPosition, 0, userOrderNumber);
    }
    
    const awards: Award[][] = Array.from({ length: group.plazo }, () => []);
    let winnerPool = [...potentialWinners];
    let desertedLicitaciones = 0;
    
    for (let i = 0; i < group.plazo; i++) {
        const isLastMonth = i === group.plazo - 1;

        if (isLastMonth) {
            // Final month: adjudicate everyone left, plus deserted licitaciones
            if (winnerPool.length > 0) {
                 winnerPool.forEach(winner => {
                    awards[i].push({ type: 'sorteo-extra', orderNumber: winner });
                });
                winnerPool = [];
            }
        } else {
            // Regular months
            const remainingMonths = group.plazo - 1 - i;
            const remainingWinners = winnerPool.length;

            let awardsThisMonth = 2; // Default: 1 sorteo, 1 licitacion
             if (remainingWinners > 0 && remainingMonths > 0 && (remainingWinners / remainingMonths > 2)) {
                 awardsThisMonth = Math.ceil(remainingWinners / remainingMonths);
                 if(awardsThisMonth % 2 !== 0) awardsThisMonth++; // Ensure pairs of sorteo/licitacion
                 awardsThisMonth = Math.min(4, awardsThisMonth);
            }

            if (winnerPool.length > 0) {
                 // Sorteo
                awards[i].push({ type: 'sorteo', orderNumber: winnerPool.shift()! });
            }

            if (winnerPool.length > 0) {
                // Licitacion with a chance to be deserted
                const isDeserted = customRandom() < 0.15; // 15% chance
                if (!isDeserted) {
                    awards[i].push({ type: 'licitacion', orderNumber: winnerPool.shift()! });
                } else {
                    desertedLicitaciones++;
                }
            }

            // Handle extra awards if needed
            for(let j = 2; j < awardsThisMonth && winnerPool.length > 0; j+=2) {
                 if (winnerPool.length > 0) awards[i].push({ type: 'sorteo', orderNumber: winnerPool.shift()! });
                 if (winnerPool.length > 0) awards[i].push({ type: 'licitacion', orderNumber: winnerPool.shift()! });
            }
        }
    }

     // Add deserted licitaciones as extra sorteos in the last month
    if (desertedLicitaciones > 0) {
        const lastMonthIndex = group.plazo - 1;
        for (let i = 0; i < desertedLicitaciones; i++) {
            // Find a winner that wasn't from the last month's mass adjudication
            const pastWinners = awards.slice(0, lastMonthIndex).flat().map(a => a.orderNumber);
            let extraWinner = memberOrderNumbers.find(n => !pastWinners.includes(n) && !awards[lastMonthIndex].some(a => a.orderNumber === n));
             if (extraWinner) {
                awards[lastMonthIndex].push({ type: 'sorteo-extra', orderNumber: extraWinner });
            }
        }
    }


    return awards;
};

// Component to safely format dates on the client side, avoiding hydration mismatch.
function ClientFormattedDate({ dateString, formatString }: { dateString: string, formatString: string }) {
  const [formattedDate, setFormattedDate] = useState(dateString);

  useEffect(() => {
    try {
      const date = parseISO(dateString);
      setFormattedDate(format(date, formatString, { locale: es }));
    } catch (error) {
      setFormattedDate(dateString);
    }
  }, [dateString, formatString]);

  return <>{formattedDate}</>;
}


export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const { groups, joinGroup, auctionGroup } = useGroups();
  const { toast } = useToast();
  const [cuotasToAdvance, setCuotasToAdvance] = useState<number>(0);
  const [cuotasToBid, setCuotasToBid] = useState<number>(0);
  const [termsAcceptedAdvance, setTermsAcceptedAdvance] = useState(false);
  const [termsAcceptedBid, setTermsAcceptedBid] = useState(false);
  const [termsAcceptedAuction, setTermsAcceptedAuction] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);


  const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);
  
  const groupAwards = useMemo(() => {
    if (!group) return [];
    return generateStaticAwards(group);
  }, [group]);

  const installments = useMemo(() => {
    if (!group) return [];
    if ((group.status === 'Activo' || group.status === 'Subastado') && group.activationDate) {
      return generateInstallments(group.capital, group.plazo, group.activationDate);
    }
    if (group.status === 'Abierto' || group.status === 'Pendiente') {
      return generateExampleInstallments(group.capital, group.plazo);
    }
    return [];
  }, [group]);


  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/my-groups">Volver a Mis Grupos</Link>
        </Button>
      </div>
    );
  }

  const cuotasPagadas = group.monthsCompleted || 0;
  
  const isMember = group.userIsMember;
  
  const realInstallments = useMemo(() => {
    if (!group || !group.activationDate) return [];
    return generateInstallments(group.capital, group.plazo, group.activationDate);
  }, [group?.capital, group?.plazo, group?.activationDate]);

  const userAwardInfo = useMemo(() => {
    if (!group) return undefined;
    for (let i = 0; i < groupAwards.length; i++) {
      const monthAward = groupAwards[i].find(a => a.orderNumber === 42);
      if (monthAward) {
        return {
          month: i + 1,
          type: monthAward.type
        };
      }
    }
    return undefined;
  }, [groupAwards, group]);

  const awardMonth = userAwardInfo?.month;
  const benefitThresholdMonth = Math.floor(group.plazo * 0.8);
  const isEligibleForBenefit = group.userIsAwarded && awardMonth && awardMonth > benefitThresholdMonth && (userAwardInfo?.type === 'sorteo' || userAwardInfo?.type === 'sorteo-extra');

  const hasNoOverduePayments = useMemo(() => {
      if(!group.activationDate) return true;
      const groupInstallments = generateInstallments(group.capital, group.plazo, group.activationDate);
      const today = new Date();
      return !groupInstallments.some(inst => inst.number <= cuotasPagadas && isBefore(parseISO(inst.dueDate), today));
  }, [group, cuotasPagadas]);

  
  const alicuotaPuraTotal = realInstallments.length > 0 ? realInstallments[0].breakdown.alicuotaPura : (group.capital / group.plazo);
  const capitalAportadoPuro = cuotasPagadas * alicuotaPuraTotal;

  const IVA = 1.21;
  const penalidadBaja = capitalAportadoPuro * 0.05 * IVA;

  const totalCuotasEmitidas = realInstallments
    .slice(0, cuotasPagadas)
    .reduce((acc, installment) => acc + installment.total, 0);

  const precioBaseSubasta = totalCuotasEmitidas * 0.5;
  const comisionVenta = precioBaseSubasta * 0.02 * IVA;
  const liquidacionEstimada = precioBaseSubasta - comisionVenta;
  
  const isPlanActive = group.status === 'Activo';

  const pendingInstallmentIndex = useMemo(() => {
    if (!isPlanActive) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return installments.findIndex(inst => inst.number > cuotasPagadas && !isBefore(parseISO(inst.dueDate), today));
  }, [installments, cuotasPagadas, isPlanActive]);
  
  const cuotasFuturas = useMemo(() => {
    if (!isPlanActive) return group.plazo - cuotasPagadas;
    
    // Find the number of the first non-paid, non-overdue installment
    const firstFutureInstallmentNumber = installments[pendingInstallmentIndex]?.number;
    
    if (firstFutureInstallmentNumber) {
        // The number of installments available to advance/bid is the total minus the number of the next one to pay
        return group.plazo - firstFutureInstallmentNumber + 1;
    }

    // If all are paid or overdue, there are no future installments
    return 0; 
  }, [pendingInstallmentIndex, installments, group.plazo, isPlanActive, cuotasPagadas]);

  const futureInstallmentsForCalculation = useMemo(() => {
    if (!isPlanActive) return [];
    if (pendingInstallmentIndex === -1) return []; // No future installments to calculate
    return realInstallments.slice(pendingInstallmentIndex);
  }, [isPlanActive, pendingInstallmentIndex, realInstallments]);
  
  const isAdvanceInputValid = cuotasToAdvance > 0 && cuotasToAdvance <= cuotasFuturas;
  const isBidInputValid = cuotasToBid > 0 && cuotasToBid <= cuotasFuturas;

  const calculateSavings = (cuotasCount: number) => {
    if (cuotasCount <= 0 || cuotasCount > futureInstallmentsForCalculation.length) return { totalToPay: 0, totalOriginal: 0, totalSaving: 0 };
    
    const installmentsToConsider = futureInstallmentsForCalculation.slice(futureInstallmentsForCalculation.length - cuotasCount);
    const totalToPay = installmentsToConsider.reduce((acc, inst) => acc + inst.breakdown.alicuotaPura, 0);
    const totalOriginal = installmentsToConsider.reduce((acc, inst) => acc + inst.total, 0);
    const totalSaving = totalOriginal - totalToPay;

    return { totalToPay, totalOriginal, totalSaving };
  }

  const advanceSavings = calculateSavings(cuotasToAdvance);
  const bidSavings = calculateSavings(cuotasToBid);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  
  const handleAuctionConfirm = () => {
    if (!group) return;
    auctionGroup(group.id);
    toast({
      title: "¡Plan puesto en subasta!",
      description: `Tu plan ${group.id} ahora está visible en el mercado secundario.`,
    });
  };

  return (
    <>
      <div className="mb-4">
        <Link href="/dashboard/my-groups" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Mis Grupos
        </Link>
        <h1 className="text-3xl font-bold font-headline">{formatCurrencyNoDecimals(group.capital)}</h1>
        <p className="text-muted-foreground">en {group.plazo} meses (Grupo {group.id})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("lg:col-span-3 flex flex-col md:flex-row gap-4", !isMember && "lg:col-span-2")}>
          {isMember && (
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Mi Plan</CardTitle>
                <CardDescription>Tu estado personal dentro del grupo.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm flex-grow">
                <div className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" /><span>N° de Orden: <strong>42</strong></span></div>
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><span>Cuotas Pagadas: <strong>{cuotasPagadas}/{group.plazo}</strong></span></div>
                <div className="flex items-center gap-2"><HandCoins className="h-4 w-4 text-primary" /><span>Capital Aportado (Puro): <strong>{formatCurrency(capitalAportadoPuro)}</strong></span></div>
                <div className="flex items-center gap-2">
                    {group.userIsAwarded ? <Trophy className="h-4 w-4 text-yellow-500" /> : <Calendar className="h-4 w-4 text-primary" />}
                    <span>Adjudicación: {group.userIsAwarded ? <strong className="text-green-600">Adjudicado (Mes {awardMonth})</strong> : <strong>Pendiente</strong>}</span>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Info del Grupo</CardTitle>
              <CardDescription>Datos generales y vitales del grupo.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>Miembros: <strong>{group.membersCount}/{group.totalMembers}</strong></span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>Plazo: <strong>{group.plazo} meses</strong></span></div>
                <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /><span>Cuota Promedio: <strong>{formatCurrency(group.cuotaPromedio)}</strong></span></div>
                <div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-primary" /><span>Adjudicaciones: <strong>2 por mes</strong></span></div>
            </CardContent>
          </Card>
        </div>

        {isEligibleForBenefit && (
            <div className="lg:col-span-3">
                 <Card className="bg-green-500/10 border-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800"><Gift className="h-6 w-6"/> ¡Beneficio "Los últimos serán los primeros"!</CardTitle>
                        <CardDescription className="text-green-700">Felicitaciones, has sido adjudicado por sorteo en la recta final y cumples con las condiciones para acceder a este beneficio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <h4 className="font-semibold mb-2">Requisitos Cumplidos:</h4>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-center gap-2">
                                    {isEligibleForBenefit ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                                    <span>Adjudicado por sorteo en el último 20% del plan (mes {awardMonth} de {group.plazo}).</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    {hasNoOverduePayments ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                                    <span>Sin cuotas vencidas durante el plan.</span>
                                </li>
                                 <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" /> 
                                    <span>No se rechazaron actos de adjudicación.</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Tus Recompensas:</h4>
                             <ul className="text-sm space-y-2">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600"/> 50% de reintegro del Derecho de Suscripción de este plan.</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600"/> 50% de descuento en el Derecho de Suscripción de tu próximo plan.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        
         {isMember && isPlanActive && (
           <div className="lg:col-span-3">
             <Card>
               <CardHeader>
                 <CardTitle>Acciones del Plan</CardTitle>
                 <CardDescription>Opciones disponibles para tu plan.</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-wrap gap-2">
                 <Dialog onOpenChange={() => { setCuotasToAdvance(0); setTermsAcceptedAdvance(false); }}>
                   <DialogTrigger asChild><Button size="sm" variant="secondary" disabled={!isPlanActive}><TrendingUp className="mr-2 h-4 w-4" /> Adelantar</Button></DialogTrigger>
                   <DialogContent>
                     <DialogHeader><DialogTitle>Adelantar Cuotas</DialogTitle><DialogDescription>Paga cuotas futuras para acortar tu plan y obtén una bonificación.</DialogDescription></DialogHeader>
                     <div className="space-y-4">
                         <div className="grid w-full items-center gap-1.5">
                             <Label htmlFor="cuotas-adelantar">Cantidad de cuotas a adelantar</Label>
                             <Input 
                                id="cuotas-adelantar"
                                type="number"
                                placeholder={`Entre 1 y ${cuotasFuturas}`}
                                value={cuotasToAdvance > 0 ? cuotasToAdvance : ''}
                                onChange={(e) => setCuotasToAdvance(Number(e.target.value))}
                                className={cn(cuotasToAdvance > 0 && !isAdvanceInputValid && "border-red-500")}
                                disabled={cuotasFuturas === 0}
                             />
                             <p className="text-xs text-muted-foreground">Adelantas las últimas cuotas de tu plan. No compite por adjudicación.</p>
                         </div>
                         {isAdvanceInputValid ? (
                             <Card className="bg-muted/50">
                                 <CardContent className="p-4 text-sm space-y-1">
                                     <p>Pagarías (valor puro): <strong>{formatCurrency(advanceSavings.totalToPay)}</strong></p>
                                     <p>En lugar de (valor final): <span className='line-through'>{formatCurrency(advanceSavings.totalOriginal)}</span></p>
                                     <p className="text-green-600 font-semibold">¡Ahorras {formatCurrency(advanceSavings.totalSaving)} en gastos administrativos y seguros!</p>
                                 </CardContent>
                             </Card>
                         ) : (
                            <p className="text-xs text-muted-foreground">
                                {cuotasFuturas > 0 ? 'Ingresa un número de cuotas válido para ver el ahorro.' : 'No tienes cuotas futuras para adelantar.'}
                            </p>
                         )}
                          <div className="items-top flex space-x-2 pt-2">
                           <Switch id="terms-advance" checked={termsAcceptedAdvance} onCheckedChange={setTermsAcceptedAdvance} disabled={!isAdvanceInputValid} />
                           <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="terms-advance" className={cn("font-medium", !isAdvanceInputValid && "text-muted-foreground")}>
                                Acepto los términos y condiciones de adelanto.
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                El monto se debitará de tu billetera. Esta acción es irreversible.
                            </p>
                           </div>
                         </div>
                     </div>
                     <DialogFooter>
                         <Button type="submit" disabled={!termsAcceptedAdvance}>Adelantar Cuotas</Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
 
                 {!group.userIsAwarded && (
                   <>
                     <Dialog onOpenChange={() => { setCuotasToBid(0); setTermsAcceptedBid(false); }}>
                       <DialogTrigger asChild>
                         <Button size="sm" disabled={!isPlanActive || cuotasPagadas < 2}>
                           <Gavel className="mr-2 h-4 w-4" /> Licitar
                         </Button>
                       </DialogTrigger>
                       <DialogContent>
                         <DialogHeader><DialogTitle>Licitar por Adjudicación</DialogTitle><DialogDescription>Ofrece adelantar cuotas para obtener el capital. Quien más ofrezca, gana.</DialogDescription></DialogHeader>
                         <div className="space-y-4">
                              <div className="grid w-full items-center gap-1.5">
                                 <Label htmlFor="cuotas-licitar">Cuotas a licitar (adelantar)</Label>
                                 <Input
                                    id="cuotas-licitar"
                                    type="number"
                                    placeholder={`Entre 1 y ${cuotasFuturas}`}
                                    value={cuotasToBid > 0 ? cuotasToBid : ''}
                                    onChange={(e) => setCuotasToBid(Number(e.target.value))}
                                    className={cn(cuotasToBid > 0 && !isBidInputValid && "border-red-500")}
                                    disabled={cuotasFuturas === 0}
                                 />
                                 <p className="text-xs text-muted-foreground">Tu oferta competirá con otros miembros. Si ganas, cancelas las últimas cuotas.</p>
                             </div>
                             {isBidInputValid ? (
                                <div className="space-y-2">
                                     <Card className="bg-muted/50">
                                         <CardContent className="p-4 text-sm space-y-1">
                                             <p>Monto de la oferta (valor puro): <strong>{formatCurrency(bidSavings.totalToPay)}</strong></p>
                                             <p className="text-green-600 font-semibold">Ahorro estimado (gastos adm. y seguros): {formatCurrency(bidSavings.totalSaving)}</p>
                                         </CardContent>
                                     </Card>
                                </div>
                             ) : (
                                <p className="text-xs text-muted-foreground">
                                    {cuotasFuturas > 0 ? 'Ingresa un número de cuotas válido para ver el monto.' : 'No tienes cuotas futuras para licitar.'}
                                </p>
                             )}
                             <div className="items-top flex space-x-2 pt-2">
                               <Switch id="terms-bid" checked={termsAcceptedBid} onCheckedChange={setTermsAcceptedBid} disabled={!isBidInputValid} />
                               <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="terms-bid" className={cn("font-medium", !isBidInputValid && "text-muted-foreground")}>
                                    Acepto los términos y condiciones de licitación.
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Si ganas y no integras el capital, se aplicará una multa del 2% (+IVA) sobre tu oferta.
                                </p>
                               </div>
                             </div>
                         </div>
                         <DialogFooter>
                             <Button type="submit" disabled={!termsAcceptedBid}>Confirmar Licitación</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                     <Dialog onOpenChange={(open) => !open && setTermsAcceptedAuction(false)}>
                       <DialogTrigger asChild>
                         <Button size="sm" variant="secondary" disabled={!isPlanActive || cuotasPagadas < 3}>
                           <Hand className="mr-2 h-4 w-4" /> Subastar
                         </Button>
                       </DialogTrigger>
                        <DialogContent>
                         <DialogHeader><DialogTitle>Subastar Plan (Vender)</DialogTitle><DialogDescription>Ofrece tu plan en el mercado secundario a otros inversores.</DialogDescription></DialogHeader>
                          <div className="space-y-4 text-sm">
                             <p>Esta es tu vía de salida flexible. A continuación un ejemplo del cálculo del precio base y lo que recibirías.</p>
                             <Card className="bg-muted/50 p-4 space-y-2">
                                <div className="flex justify-between"><span>Total Cuotas Emitidas:</span><strong>{formatCurrency(totalCuotasEmitidas)}</strong></div>
                                <div className="flex justify-between"><span>Precio Base Subasta (50%):</span><strong>{formatCurrency(precioBaseSubasta)}</strong></div>
                                <div className="flex justify-between text-red-600"><span>Comisión por Venta (2% + IVA):</span><strong>-{formatCurrency(comisionVenta)}</strong></div>
                                <div className="flex justify-between font-bold border-t pt-2"><span>Liquidación Estimada (al Precio Base):</span><strong>{formatCurrency(liquidacionEstimada)}</strong></div>
                                <p className="text-xs text-muted-foreground mt-2">El valor final dependerá del precio de venta en la subasta.</p>
                             </Card>
                             <div className="items-top flex space-x-2 pt-2">
                               <Switch id="terms-auction" checked={termsAcceptedAuction} onCheckedChange={setTermsAcceptedAuction} />
                               <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="terms-auction" className="font-medium">
                                    Acepto los términos y condiciones de la subasta.
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Confirmo que entiendo que el precio base es una estimación y el valor final dependerá de la oferta ganadora.
                                </p>
                               </div>
                             </div>
                         </div>
                         <DialogFooter>
                          <DialogClose asChild>
                            <Button
                                type="button"
                                onClick={handleAuctionConfirm}
                                disabled={!termsAcceptedAuction}
                            >
                                Poner en Subasta
                            </Button>
                          </DialogClose>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                     <Dialog>
                       <DialogTrigger asChild><Button size="sm" variant="destructive" disabled={!isPlanActive}><FileX2 className="mr-2 h-4 w-4" /> Dar de Baja</Button></DialogTrigger>
                       <DialogContent>
                         <DialogHeader><DialogTitle>Dar de Baja el Plan</DialogTitle><DialogDescription>Rescinde tu contrato. Aplica solo para planes no adjudicados.</DialogDescription></DialogHeader>
                         <div className="space-y-4 text-sm">
                             <p>Se te devolverá el capital puro aportado al finalizar el grupo, menos una penalidad. Ejemplo del cálculo:</p>
                             <Card className="bg-muted/50 p-4 space-y-2">
                                <div className="flex justify-between"><span>Capital Aportado (Puro):</span><strong>{formatCurrency(capitalAportadoPuro)}</strong></div>
                                <div className="flex justify-between text-red-600"><span>Penalidad (5% + IVA):</span><strong>-{formatCurrency(penalidadBaja)}</strong></div>
                                <div className="flex justify-between font-bold border-t pt-2"><span>Monto a Devolver (al final):</span><strong>{formatCurrency(capitalAportadoPuro - penalidadBaja)}</strong></div>
                             </Card>
                              <p className="text-xs text-muted-foreground">La devolución se efectuará una vez finalizado el plazo original del grupo para no afectar al resto de los miembros.</p>
                         </div>
                         <DialogFooter>
                             <Button type="submit" variant="destructive">Confirmar Baja</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                   </>
                 )}
               </CardContent>
             </Card>
           </div>
         )}
        
        {isMember && group.status === 'Subastado' && (
            <div className="lg:col-span-3">
                <Card>
                <CardHeader>
                    <CardTitle className='text-orange-600'>Plan en Subasta</CardTitle>
                    <CardDescription>
                        Este plan se encuentra en el mercado secundario. Las acciones ya no están disponibles aquí.
                        Puedes seguir el estado de la subasta en el módulo correspondiente.
                    </CardDescription>
                </CardHeader>
                </Card>
            </div>
        )}

        {(group.status === 'Abierto' || group.status === 'Pendiente' || group.status === 'Activo' || group.status === 'Subastado') && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Plan de Cuotas { (group.status === 'Abierto' || group.status === 'Pendiente') ? '(Ejemplo)' : ''}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Info Adjudicación</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((inst, index) => {
                      let status: Installment['status'] = 'Futuro';
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      if (group.status === 'Activo' || group.status === 'Subastado') {
                          if (inst.number <= cuotasPagadas) {
                            status = 'Pagado';
                          } else {
                            const dueDate = parseISO(inst.dueDate);
                            if (isBefore(dueDate, today)) {
                              status = 'Vencido';
                            } else {
                                // Find the very first installment that is not paid and not overdue
                                if (index === pendingInstallmentIndex) {
                                    status = 'Pendiente';
                                } else {
                                    status = 'Futuro';
                                }
                            }
                          }
                      }
                      
                      const currentAwards = groupAwards[inst.number - 1];
                      const awardDateString = (isPlanActive && currentAwards && currentAwards.length > 0) ? addDays(parseISO(inst.dueDate), 5).toISOString() : undefined;

                      return (
                        <TableRow key={inst.id}>
                          <TableCell>{inst.number}</TableCell>
                          <TableCell>{inst.dueDate.startsWith('Mes') ? inst.dueDate : <ClientFormattedDate dateString={inst.dueDate} formatString="dd/MM/yyyy" />}</TableCell>
                          <TableCell>
                            <Badge variant={status === 'Pagado' ? 'default' : status === 'Pendiente' ? 'secondary' : status === 'Vencido' ? 'destructive' : 'outline'}
                              className={cn(
                                status === 'Pagado' && 'bg-green-500/20 text-green-700 border-green-500/30',
                                status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                                status === 'Vencido' && 'bg-red-500/20 text-red-700 border-red-500/30',
                              )}
                            >{status}</Badge>
                          </TableCell>
                           <TableCell className="text-xs text-muted-foreground">
                              {awardDateString && (
                                  <div className="flex items-center gap-2">
                                       <CalendarCheck className="h-4 w-4" />
                                       <span>{<ClientFormattedDate dateString={awardDateString} formatString="dd/MM/yyyy" />}</span>
                                  </div>
                              )}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                 {currentAwards?.map(award => (
                                  <div key={`${award.type}-${award.orderNumber}`} className="flex items-center gap-1">
                                    {award.type === 'sorteo' && <Ticket className="h-4 w-4 text-blue-500" />}
                                    {award.type === 'licitacion' && <HandCoins className="h-4 w-4 text-orange-500" />}
                                    {award.type === 'sorteo-extra' && <Sparkles className="h-4 w-4 text-fuchsia-500" />}
                                    <span className={cn(award.orderNumber === 42 && "font-bold text-primary")}>#{award.orderNumber}</span>
                                  </div>
                                ))}
                              </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(inst.total)}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="outline" size="sm" onClick={() => setSelectedInstallment(inst)}>
                              Ver Detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {selectedInstallment && (
        <Dialog open={!!selectedInstallment} onOpenChange={(open) => !open && setSelectedInstallment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de la Cuota #{selectedInstallment.number}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span>Alícuota Pura:</span><strong>{formatCurrency(selectedInstallment.breakdown.alicuotaPura)}</strong></div>
                <div className="flex justify-between"><span>Gastos Adm (IVA incl.):</span><strong>{formatCurrency(selectedInstallment.breakdown.gastosAdm)}</strong></div>
                {selectedInstallment.breakdown.derechoSuscripcion && (
                  <div className="flex justify-between"><span>Derecho Suscripción (IVA incl.):</span><strong>{formatCurrency(selectedInstallment.breakdown.derechoSuscripcion)}</strong></div>
                )}
                <div className="flex justify-between"><span>Seguro de Vida:</span><strong>{formatCurrency(selectedInstallment.breakdown.seguroVida)}</strong></div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span><span>{formatCurrency(selectedInstallment.total)}</span></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
