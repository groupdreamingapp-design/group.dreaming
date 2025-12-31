
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
import { ArrowLeft, Users, Clock, Users2, Calendar, Gavel, HandCoins, Ticket, Info, Trophy, FileX2, TrendingUp, Hand, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useGroups } from '@/hooks/use-groups';
import { installments as allInstallments, initialGroups } from '@/lib/data';
import { useMemo } from 'react';

type GroupDetailClientProps = {
    groupId: string;
};

const generateStaticAwards = (groupId: string, totalMembers: number, totalMonths: number, isAwarded: boolean = false): Award[][] => {
    // Simple pseudo-random number generator to ensure consistency between server and client
    let seed = 0;
    for (let i = 0; i < groupId.length; i++) {
        seed = (seed + groupId.charCodeAt(i)) % 1000000;
    }
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const memberOrderNumbers = Array.from({ length: totalMembers }, (_, i) => i + 1);
    const userOrderNumber = 42;

    const shuffle = (array: number[]) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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
        // Ensure user is awarded in one of the first few months for visibility
        const userWinMonthIndex = 4; // 5th month
        potentialWinners.splice(userWinMonthIndex * 2, 0, userOrderNumber);
    }
    
    const awards: Award[][] = [];
    for (let i = 0; i < totalMonths; i++) {
        if (potentialWinners.length < 2) break;
        awards.push([
            { type: 'sorteo', orderNumber: potentialWinners.shift()! },
            { type: 'licitacion', orderNumber: potentialWinners.shift()! }
        ]);
    }

    return awards;
};


export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const { groups } = useGroups();
  // Find group from initialGroups to get template info, then merge with dynamic state
  const groupTemplate = initialGroups.find(g => g.id === groupId);
  const dynamicGroupState = groups.find(g => g.id === groupId);
  const group = dynamicGroupState ? { ...groupTemplate, ...dynamicGroupState } : undefined;
  
  const groupAwards = useMemo(() => {
    if (!group) return [];
    return generateStaticAwards(group.id, group.totalMembers, group.plazo, group.userIsAwarded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Filter installments to only show the ones relevant for this group's term
  const installments = allInstallments.slice(0, group.plazo);
  const cuotasPagadas = group.monthsCompleted || 0;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const isMember = group.userIsMember;
  
  const alicuotaPuraTotal = installments.length > 0 ? installments[0].breakdown.alicuotaPura : 0;
  const capitalAportadoPuro = cuotasPagadas * alicuotaPuraTotal;

  const IVA = 1.21;
  const penalidadBaja = capitalAportadoPuro * 0.05 * IVA; // 5% de penalidad + 21% IVA sobre la penalidad
  const comisionVenta = capitalAportadoPuro * 0.02 * IVA; // 2% de comisión + 21% IVA
  const liquidacionMinima = capitalAportadoPuro - comisionVenta;

  return (
    <>
      <div className="mb-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Mi Panel
        </Link>
        <h1 className="text-3xl font-bold font-headline">{formatCurrencyNoDecimals(group.capital)}</h1>
        <p className="text-muted-foreground">en {group.plazo} meses (Grupo {group.id})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
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
              {isMember && !group.userIsAwarded && group.status === 'Activo' && (
                <CardFooter className="flex-wrap gap-2">
                  {/* Licitar */}
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm"><Gavel className="mr-2 h-4 w-4" /> Licitar</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Licitar por Adjudicación</DialogTitle><DialogDescription>Ofrece adelantar cuotas para obtener el capital. Quien más ofrezca, gana.</DialogDescription></DialogHeader>
                      <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">Tu oferta competirá con otros miembros. Si ganas, el monto se usa para cancelar las últimas cuotas de tu plan.</p>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="cuotas-licitar">Cuotas a licitar (adelantar)</Label>
                              <Input type="number" id="cuotas-licitar" placeholder="Ej: 10" />
                          </div>
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
                  {/* Adelantar Cuotas */}
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm" variant="secondary"><TrendingUp className="mr-2 h-4 w-4" /> Adelantar</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Adelantar Cuotas</DialogTitle><DialogDescription>Paga cuotas futuras para acortar tu plan y obtén una bonificación.</DialogDescription></DialogHeader>
                      <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">No compite por adjudicación, pero reduce el costo final de tu plan.</p>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="cuotas-adelantar">Cantidad de cuotas a adelantar</Label>
                              <Input type="number" id="cuotas-adelantar" placeholder="Ej: 5" />
                          </div>
                          <Card className="bg-muted/50">
                              <CardContent className="p-4 text-sm">
                                  <p>Pagarías: <strong>{formatCurrency(1850)}</strong> en lugar de {formatCurrency(1900)}.</p>
                                  <p className="text-green-600">¡Ahorras {formatCurrency(50)} en gastos y seguros!</p>
                              </CardContent>
                          </Card>
                      </div>
                      <DialogFooter>
                          <Button type="submit">Adelantar Cuotas</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {/* Subastar Plan */}
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm" variant="secondary"><Hand className="mr-2 h-4 w-4" /> Subastar</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Subastar Plan (Vender)</DialogTitle><DialogDescription>Ofrece tu plan en el mercado secundario a otros inversores.</DialogDescription></DialogHeader>
                       <div className="space-y-4 text-sm">
                          <p>Esta es tu vía de salida flexible. A continuación un ejemplo del cálculo del precio base y lo que recibirías.</p>
                          <Card className="bg-muted/50 p-4 space-y-2">
                             <div className="flex justify-between"><span>Capital Aportado (Puro):</span><strong>{formatCurrency(capitalAportadoPuro)}</strong></div>
                             <div className="flex justify-between text-red-600"><span>Comisión por Venta (2% + IVA):</span><strong>-{formatCurrency(comisionVenta)}</strong></div>
                             <div className="flex justify-between font-bold border-t pt-2"><span>Liquidación Estimada (Precio Base):</span><strong>{formatCurrency(liquidacionMinima)}</strong></div>
                             <p className="text-xs text-muted-foreground">El valor final dependerá del precio de venta en la subasta.</p>
                          </Card>
                      </div>
                      <DialogFooter>
                          <Button type="submit">Poner en Subasta</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {/* Dar de Baja */}
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
                </CardFooter>
              )}
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
                    if (inst.number <= cuotasPagadas) {
                      status = 'Pagado';
                    } else if (group.status === 'Activo' && inst.number === cuotasPagadas + 1) {
                      status = 'Pendiente';
                    } else {
                      status = 'Futuro';
                    }
                    
                    const currentAwards = status === 'Pagado' ? groupAwards[inst.number - 1] : undefined;

                    return (
                      <TableRow key={inst.id}>
                        <TableCell>{inst.number}</TableCell>
                        <TableCell>{inst.dueDate}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'Pagado' ? 'default' : status === 'Pendiente' ? 'secondary' : 'outline'}
                            className={cn(
                              status === 'Pagado' && 'bg-green-500/20 text-green-700 border-green-500/30',
                              status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                            )}
                          >{status}</Badge>
                        </TableCell>
                         <TableCell className="flex items-center gap-2">
                          {currentAwards?.map(award => (
                            <span key={`${award.type}-${award.orderNumber}`} className="flex items-center gap-1 text-xs">
                              {award.type === 'sorteo' && <Ticket className="h-4 w-4 text-blue-500" />}
                              {award.type === 'licitacion' && <HandCoins className="h-4 w-4 text-orange-500" />}
                              #{award.orderNumber}
                            </span>
                          ))}
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

        {isMember && group.status === 'Cerrado' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Plan Finalizado</CardTitle>
                <CardDescription>Este grupo ha concluido. No hay más acciones disponibles.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
