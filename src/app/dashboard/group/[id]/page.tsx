'use client';
import { useParams } from 'next/navigation';
import { groups, user as currentUser } from '@/lib/data';
import type { Group, Installment } from '@/lib/types';
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

const installments: Installment[] = Array.from({ length: 60 }, (_, i) => ({
  id: `cuota-${i + 1}`,
  number: i + 1,
  dueDate: `2024-${((i + 7) % 12) + 1}-10`,
  status: i < 5 ? 'Pagado' : i === 5 ? 'Pendiente' : 'Futuro',
  total: 380,
  breakdown: {
    alicuotaPura: 333.33,
    gastosAdm: 33.33,
    seguroVida: 13.34
  },
  award: i === 2 ? { type: 'sorteo', orderNumber: 25 } : i === 4 ? { type: 'licitacion', orderNumber: 11 } : undefined,
}));

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/explore-groups">Explorar otros grupos</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const isMember = group.userIsMember;
  const cuotasPagadas = 5;
  const capitalAportado = cuotasPagadas * installments[0].breakdown.alicuotaPura;

  return (
    <>
      <div className="mb-4">
        <Link href="/dashboard/my-groups" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Mis Grupos
        </Link>
        <h1 className="text-3xl font-bold font-headline">Grupo {group.id}</h1>
        <p className="text-muted-foreground">Capital de {formatCurrency(group.capital)} en {group.plazo} meses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
          {isMember && (
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Mi Plan</CardTitle>
                <CardDescription>Tu estado personal dentro del grupo.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" /><span>N° de Orden: <strong>42</strong></span></div>
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><span>Cuotas Pagadas: <strong>{cuotasPagadas}/{group.plazo}</strong></span></div>
                <div className="flex items-center gap-2"><HandCoins className="h-4 w-4 text-primary" /><span>Capital Aportado: <strong>{formatCurrency(capitalAportado)}</strong></span></div>
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
                  {installments.slice(0, 12).map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.number}</TableCell>
                      <TableCell>{inst.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={inst.status === 'Pagado' ? 'default' : inst.status === 'Pendiente' ? 'secondary' : 'outline'}
                          className={cn(
                            inst.status === 'Pagado' && 'bg-green-500/20 text-green-700 border-green-500/30',
                            inst.status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                          )}
                        >{inst.status}</Badge>
                      </TableCell>
                       <TableCell className="flex items-center gap-4">
                        {inst.award?.type === 'sorteo' && <span className="flex items-center gap-1 text-xs"><Ticket className="h-4 w-4 text-blue-500" /> #{inst.award.orderNumber}</span>}
                        {inst.award?.type === 'licitacion' && <span className="flex items-center gap-1 text-xs"><HandCoins className="h-4 w-4 text-orange-500" /> #{inst.award.orderNumber}</span>}
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
                                <div className="flex justify-between"><span>Gastos Adm:</span><strong>{formatCurrency(inst.breakdown.gastosAdm)}</strong></div>
                                <div className="flex justify-between"><span>Seguro de Vida:</span><strong>{formatCurrency(inst.breakdown.seguroVida)}</strong></div>
                                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span><span>{formatCurrency(inst.total)}</span></div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {isMember && !group.userIsAwarded && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Acciones del Plan</CardTitle>
                <CardDescription>Gestiona tu inversión y toma control de tu plan.</CardDescription>
              </CardHeader>
              <CardFooter className="flex-wrap gap-4">
                {/* Licitar */}
                <Dialog>
                  <DialogTrigger asChild><Button><Gavel className="mr-2" /> Licitar</Button></DialogTrigger>
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
                        <p className="text-xs text-muted-foreground">El sistema pujará por ti hasta un máximo que definas.</p>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Confirmar Licitación</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Adelantar Cuotas */}
                <Dialog>
                  <DialogTrigger asChild><Button variant="secondary"><TrendingUp className="mr-2" /> Adelantar Cuotas</Button></DialogTrigger>
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
                  <DialogTrigger asChild><Button variant="secondary"><Hand className="mr-2" /> Subastar Plan</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Subastar Plan (Vender)</DialogTitle><DialogDescription>Ofrece tu plan en el mercado secundario a otros inversores.</DialogDescription></DialogHeader>
                     <div className="space-y-4 text-sm">
                        <p>Esta es tu vía de salida flexible. A continuación un ejemplo del cálculo del precio base y lo que recibirías.</p>
                        <Card className="bg-muted/50 p-4 space-y-2">
                           <div className="flex justify-between"><span>Capital Aportado:</span><strong>{formatCurrency(capitalAportado)}</strong></div>
                           <div className="flex justify-between"><span>Deuda Pendiente (si aplica):</span><strong>{formatCurrency(0)}</strong></div>
                           <div className="flex justify-between font-bold border-t pt-2"><span>Precio Base Sugerido:</span><strong>{formatCurrency(capitalAportado)}</strong></div>
                           <hr/>
                           <div className="flex justify-between text-green-700"><span>Liquidación Mínima a Recibir:</span><strong>{formatCurrency(capitalAportado * 0.98)}</strong></div>
                           <p className="text-xs text-muted-foreground">(Se descuenta una comisión del 2% por la operación)</p>
                        </Card>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Poner en Subasta</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Dar de Baja */}
                <Dialog>
                  <DialogTrigger asChild><Button variant="destructive"><FileX2 className="mr-2" /> Dar de Baja</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Dar de Baja el Plan</DialogTitle><DialogDescription>Rescinde tu contrato. Aplica solo para planes no adjudicados.</DialogDescription></DialogHeader>
                    <div className="space-y-4 text-sm">
                        <p>Se te devolverá el capital aportado al finalizar el grupo, menos una penalidad. Ejemplo del cálculo:</p>
                        <Card className="bg-muted/50 p-4 space-y-2">
                           <div className="flex justify-between"><span>Capital Aportado:</span><strong>{formatCurrency(capitalAportado)}</strong></div>
                           <div className="flex justify-between text-red-600"><span>Penalidad (5% + IVA):</span><strong>-{formatCurrency(capitalAportado * 0.0605)}</strong></div>
                           <div className="flex justify-between font-bold border-t pt-2"><span>Monto a Devolver (al final):</span><strong>{formatCurrency(capitalAportado * (1 - 0.0605))}</strong></div>
                        </Card>
                         <p className="text-xs text-muted-foreground">La devolución se efectuará una vez finalizado el plazo original del grupo para no afectar al resto de los miembros.</p>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="destructive">Confirmar Baja</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}