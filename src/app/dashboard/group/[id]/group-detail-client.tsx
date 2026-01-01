

'use client';

import type { Group, Installment, Award } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, Clock, Users2, Calendar, Gavel, HandCoins, Ticket, Info, Trophy, FileX2, TrendingUp, Hand, Scale, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useGroups } from '@/hooks/use-groups';
import { installments as allInstallments, initialGroups } from '@/lib/data';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { addDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';


type GroupDetailClientProps = {
    groupId: string;
};

const generateStaticAwards = (groupId: string, totalMembers: number, totalMonths: number, isAwarded: boolean = false): Award[][] => {
    let seed = 0;
    for (let i = 0; i < groupId.length; i++) {
        seed = (seed + groupId.charCodeAt(i)) % 1000000;
    }
    const customRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const memberOrderNumbers = Array.from({ length: totalMembers }, (_, i) => i + 1);
    const userOrderNumber = 42; 

    const shuffle = (array: number[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(customRandom() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    
    let potentialWinners = [...memberOrderNumbers];
    
    if (isAwarded) {
        const userIndex = potentialWinners.indexOf(userOrderNumber);
        if (userIndex > -1) {
            potentialWinners.splice(userIndex, 1);
        }
    }
    
    potentialWinners = shuffle(potentialWinners);
    
    if (isAwarded) {
        const awardsPerMonth = 2;
        const insertPosition = 4 * awardsPerMonth; 
        
        potentialWinners.splice(insertPosition, 0, userOrderNumber);
    }
    
    const awards: Award[][] = [];
    let winnerPool = [...potentialWinners];
    
    for (let i = 0; i < totalMonths; i++) {
        const monthAwards: Award[] = [];
        if (winnerPool.length > 0) {
            monthAwards.push({ type: 'sorteo', orderNumber: winnerPool.shift()! });
        }
        if (winnerPool.length > 0) {
            monthAwards.push({ type: 'licitacion', orderNumber: winnerPool.shift()! });
        }
        if (monthAwards.length > 0) {
            awards.push(monthAwards);
        }
    }

    return awards;
};


export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const { groups } = useGroups();
  const [cuotasToAdvance, setCuotasToAdvance] = useState<number>(0);
  const [cuotasToBid, setCuotasToBid] = useState<number>(0);

  const groupTemplate = initialGroups.find(g => g.id === groupId);
  const dynamicGroupState = groups.find(g => g.id === groupId);
  const group = dynamicGroupState ? { ...groupTemplate, ...dynamicGroupState } : groupTemplate;
  
  const groupAwards = useMemo(() => {
    if (!group) return [];
    return generateStaticAwards(group.id, group.totalMembers, group.plazo, group.userIsAwarded);
  }, [group?.id, group?.totalMembers, group?.plazo, group?.userIsAwarded]);


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

  const installments = allInstallments.slice(0, group.plazo);
  const cuotasPagadas = group.monthsCompleted || 0;
  const cuotasRestantes = group.plazo - cuotasPagadas;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => format(parseISO(dateString), 'dd/MM/yyyy');
  const isMember = group.userIsMember;
  
  const alicuotaPuraTotal = installments.length > 0 ? installments[0].breakdown.alicuotaPura : 0;
  const capitalAportadoPuro = cuotasPagadas * alicuotaPuraTotal;

  const IVA = 1.21;
  const penalidadBaja = capitalAportadoPuro * 0.05 * IVA;

  const totalCuotasEmitidas = allInstallments
    .slice(0, cuotasPagadas)
    .reduce((acc, installment) => acc + installment.total, 0);

  const precioBaseSubasta = totalCuotasEmitidas * 0.5;
  const comisionVenta = precioBaseSubasta * 0.02 * IVA;
  const liquidacionEstimada = precioBaseSubasta - comisionVenta;
  

  const futureInstallments = installments.slice(cuotasPagadas, group.plazo);

  const calculateSavings = (cuotasCount: number) => {
    if (cuotasCount <= 0 || cuotasCount > futureInstallments.length) return { totalToPay: 0, totalOriginal: 0, totalSaving: 0 };
    
    const installmentsToConsider = futureInstallments.slice(0, cuotasCount);
    const totalToPay = installmentsToConsider.reduce((acc, inst) => acc + inst.breakdown.alicuotaPura, 0);
    const totalOriginal = installmentsToConsider.reduce((acc, inst) => acc + inst.total, 0);
    const totalSaving = totalOriginal - totalToPay;

    return { totalToPay, totalOriginal, totalSaving };
  }

  const advanceSavings = calculateSavings(cuotasToAdvance);
  const bidSavings = calculateSavings(cuotasToBid);

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
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
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
                    <span>Adjudicación: {group.userIsAwarded ? <strong className="text-green-600">Adjudicado</strong> : <strong>Pendiente</strong>}</span>
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
        
        {isMember && group.status === 'Activo' && (
           <div className="lg:col-span-3">
             <Card>
               <CardHeader>
                 <CardTitle>Acciones del Plan</CardTitle>
                 <CardDescription>Opciones disponibles para tu plan.</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-wrap gap-2">
                 <Dialog onOpenChange={() => setCuotasToAdvance(0)}>
                   <DialogTrigger asChild><Button size="sm" variant="secondary"><TrendingUp className="mr-2 h-4 w-4" /> Adelantar</Button></DialogTrigger>
                   <DialogContent>
                     <DialogHeader><DialogTitle>Adelantar Cuotas</DialogTitle><DialogDescription>Paga cuotas futuras para acortar tu plan y obtén una bonificación.</DialogDescription></DialogHeader>
                     <div className="space-y-4">
                         <p className="text-sm text-muted-foreground">No compite por adjudicación, pero reduce el costo final de tu plan.</p>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                             <Label htmlFor="cuotas-adelantar">Cantidad de cuotas a adelantar</Label>
                              <Select onValueChange={(value) => setCuotasToAdvance(Number(value))}>
                                 <SelectTrigger id="cuotas-adelantar">
                                     <SelectValue placeholder="Selecciona la cantidad de cuotas" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {Array.from({ length: cuotasRestantes }, (_, i) => i + 1).map(num => (
                                         <SelectItem key={num} value={String(num)}>{num} cuota{num > 1 && 's'}</SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                         </div>
                         {cuotasToAdvance > 0 ? (
                             <Card className="bg-muted/50">
                                 <CardContent className="p-4 text-sm space-y-1">
                                     <p>Pagarías (valor puro): <strong>{formatCurrency(advanceSavings.totalToPay)}</strong></p>
                                     <p>En lugar de (valor final): <span className='line-through'>{formatCurrency(advanceSavings.totalOriginal)}</span></p>
                                     <p className="text-green-600 font-semibold">¡Ahorras {formatCurrency(advanceSavings.totalSaving)} en gastos y seguros!</p>
                                 </CardContent>
                             </Card>
                         ) : (
                             <p className="text-xs text-muted-foreground">Selecciona una cantidad de cuotas para ver el ahorro.</p>
                         )}
                     </div>
                     <DialogFooter>
                         <Button type="submit">Adelantar Cuotas</Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
 
                 {!group.userIsAwarded && (
                   <>
                     <Dialog onOpenChange={() => setCuotasToBid(0)}>
                       <DialogTrigger asChild><Button size="sm"><Gavel className="mr-2 h-4 w-4" /> Licitar</Button></DialogTrigger>
                       <DialogContent>
                         <DialogHeader><DialogTitle>Licitar por Adjudicación</DialogTitle><DialogDescription>Ofrece adelantar cuotas para obtener el capital. Quien más ofrezca, gana.</DialogDescription></DialogHeader>
                         <div className="space-y-4">
                             <p className="text-sm text-muted-foreground">Tu oferta competirá con otros miembros. Si ganas, el monto se usa para cancelar las últimas cuotas de tu plan.</p>
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                                 <Label htmlFor="cuotas-licitar">Cuotas a licitar (adelantar)</Label>
                                 <Select onValueChange={(value) => setCuotasToBid(Number(value))}>
                                     <SelectTrigger id="cuotas-licitar">
                                         <SelectValue placeholder="Selecciona la cantidad de cuotas" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         {Array.from({ length: cuotasRestantes }, (_, i) => i + 1).map(num => (
                                             <SelectItem key={num} value={String(num)}>{num} cuota{num > 1 && 's'}</SelectItem>
                                         ))}
                                     </SelectContent>
                                 </Select>
                             </div>
                             {cuotasToBid > 0 ? (
                                 <Card className="bg-muted/50">
                                     <CardContent className="p-4 text-sm space-y-1">
                                         <p>Pagarías (valor puro): <strong>{formatCurrency(bidSavings.totalToPay)}</strong></p>
                                         <p>En lugar de (valor final): <span className='line-through'>{formatCurrency(bidSavings.totalOriginal)}</span></p>
                                         <p className="text-green-600 font-semibold">¡Ahorras {formatCurrency(bidSavings.totalSaving)} en gastos y seguros!</p>
                                     </CardContent>
                                 </Card>
                             ) : (
                                 <p className="text-xs text-muted-foreground">Selecciona una cantidad de cuotas para ver el ahorro.</p>
                             )}
                             <div className="flex items-center space-x-2">
                               <Switch id="licitacion-automatica" />
                               <Label htmlFor="licitacion-automatica">Activar Licitación Automática</Label>
                             </div>
                             <p className="text-xs text-muted-foreground">Recuerda que si ganas y no integras el capital, se aplicará una multa del 2% (+IVA) sobre tu oferta.</p>
                         </div>
                         <DialogFooter>
                             <Button type="submit">Confirmar Licitación</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                     <Dialog>
                       <DialogTrigger asChild><Button size="sm" variant="secondary"><Hand className="mr-2 h-4 w-4" /> Subastar</Button></DialogTrigger>
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
                         </div>
                         <DialogFooter>
                             <Button type="submit">Poner en Subasta</Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                     <Dialog>
                       <DialogTrigger asChild><Button size="sm" variant="destructive"><FileX2 className="mr-2 h-4 w-4" /> Dar de Baja</Button></DialogTrigger>
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
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Plan de Cuotas</CardTitle>
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
                  {installments.map((inst) => {
                    let status: Installment['status'];
                    const today = new Date();
                    const dueDate = parseISO(inst.dueDate);
                    
                    if (inst.number <= cuotasPagadas) {
                      status = 'Pagado';
                    } else if (group.status === 'Subastado') {
                        status = dueDate < today ? 'Vencido' : 'Futuro';
                    } else if (dueDate < today) {
                        status = 'Vencido';
                    } else if (inst.number === cuotasPagadas + 1) {
                      status = 'Pendiente';
                    } else {
                      status = 'Futuro';
                    }
                    
                    const currentAwards = status === 'Pagado' ? groupAwards[inst.number - 1] : undefined;
                    const awardDate = status === 'Pagado' ? format(addDays(dueDate, 5), 'dd/MM/yyyy') : undefined;

                    return (
                      <TableRow key={inst.id}>
                        <TableCell>{inst.number}</TableCell>
                        <TableCell>{formatDate(inst.dueDate)}</TableCell>
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
                            {awardDate && (
                                <div className="flex items-center gap-2">
                                     <CalendarCheck className="h-4 w-4" />
                                     <span>{awardDate}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                               {currentAwards?.map(award => (
                                <div key={`${award.type}-${award.orderNumber}`} className="flex items-center gap-1">
                                  {award.type === 'sorteo' && <Ticket className="h-4 w-4 text-blue-500" />}
                                  {award.type === 'licitacion' && <HandCoins className="h-4 w-4 text-orange-500" />}
                                  <span>#{award.orderNumber}</span>
                                </div>
                              ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(inst.total)}</TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Ver Detalle</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalle de la Cuota #{inst.number}</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between"><span>Alícuota Pura:</span><strong>{formatCurrency(inst.breakdown.alicuotaPura)}</strong></div>
                                  <div className="flex justify-between"><span>Gastos Adm (IVA incl.):</span><strong>{formatCurrency(inst.breakdown.gastosAdm)}</strong></div>
                                  {inst.breakdown.derechoSuscripcion && (
                                    <div className="flex justify-between"><span>Derecho Suscripción (IVA incl.):</span><strong>{formatCurrency(inst.breakdown.derechoSuscripcion)}</strong></div>
                                  )}
                                  <div className="flex justify-between"><span>Seguro de Vida:</span><strong>{formatCurrency(inst.breakdown.seguroVida)}</strong></div>
                                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span><span>{formatCurrency(inst.total)}</span></div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {isMember && (group.status === 'Cerrado' || group.status === 'Subastado') && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Plan {group.status === 'Cerrado' ? 'Finalizado' : 'en Subasta'}</CardTitle>
                <CardDescription>
                    {group.status === 'Cerrado' 
                        ? 'Este grupo ha concluido. No hay más acciones disponibles.' 
                        : 'Este plan está en el mercado secundario. Las acciones se gestionan desde la sección de Subastas.'
                    }
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
