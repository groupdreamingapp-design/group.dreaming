
'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { initialGroups, generateExampleInstallments, calculateTotalFinancialCost } from '@/lib/data';
import type { Installment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Users, Clock, Scale, Users2, FileX2, CheckCircle, Ticket, HandCoins, ShieldAlert, Zap, Percent, BadgePercent } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserNav } from '@/components/app/user-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

export default function GroupPublicDetail() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  
  const groupId = typeof params.id === 'string' ? params.id : '';
  const group = useMemo(() => initialGroups.find(g => g.id === groupId), [groupId]);

  useEffect(() => {
    if (!userLoading && user) {
        // If user is logged in, redirect them to the panel version of this page
        router.replace(`/panel/group-public/${groupId}`);
    }
  }, [user, userLoading, router, groupId]);

  if (userLoading || user) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
        <Button asChild className="mt-4">
          <Link href="/explore">Volver a Explorar</Link>
        </Button>
      </div>
    );
  }

  const exampleInstallments = generateExampleInstallments(group.capital, group.plazo);
  const totalFinancialCost = calculateTotalFinancialCost(group.capital, group.plazo);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const renderCTA = () => {
    return (
        <div className='flex gap-2'>
            <Button variant="ghost" asChild>
                <Link href={`/login?redirect=${pathname}`}>Ingresar para Unirte</Link>
            </Button>
            <Button asChild>
                <Link href={`/register?redirect=${pathname}`}>Comenzar Ahora</Link>
            </Button>
        </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/explore" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Explorar
        </Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">{formatCurrencyNoDecimals(group.capital)}</h1>
                <p className="text-muted-foreground">en {group.plazo} meses (Grupo {group.id})</p>
            </div>
            {renderCTA()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Datos clave sobre este plan de ahorro.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>Miembros: <strong>{group.membersCount}/{group.totalMembers}</strong></span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>Plazo: <strong>{group.plazo} meses</strong></span></div>
                    <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /><span>Cuota Promedio: <strong>{formatCurrency(group.cuotaPromedio)}</strong></span></div>
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span>Adjudicaciones:</span>
                      <strong className="flex items-center gap-1.5">
                        <span>1</span><Ticket className="h-4 w-4 text-blue-500" title="Sorteo" />
                        <span>+ 1</span><HandCoins className="h-4 w-4 text-orange-500" title="Licitación" />
                      </strong>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BadgePercent className="h-5 w-5 text-primary" />
                    Costo Financiero Total (CFT) Promedio
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-primary">{totalFinancialCost.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Este es el costo total aproximado sobre el capital por gastos administrativos y seguros. Este porcentaje puede reducirse significativamente al licitar, adelantar cuotas u obtener beneficios.</p>
            </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plan de Cuotas (Ejemplo)
                {group.isImmediateActivation && <Badge variant="destructive"><Zap className="mr-1 h-3 w-3" />Activación Inmediata</Badge>}
              </CardTitle>
              <CardDescription>Así se compone tu cuota mensual. Los valores son aproximados.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Total Aproximado</TableHead>
                      <TableHead className="text-center">Detalle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exampleInstallments.map((inst: Installment) => (
                      <TableRow key={inst.id}>
                        <TableCell>{inst.number}</TableCell>
                        <TableCell>{inst.dueDate}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(inst.total)}</TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Ver Desglose</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Desglose de la Cuota #{inst.number}</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between"><span>Alícuota Pura:</span><strong>{formatCurrency(inst.breakdown.alicuotaPura)}</strong></div>
                                  <div className="flex justify-between"><span>Gastos Adm (IVA incl.):</span><strong>{formatCurrency(inst.breakdown.gastosAdm)}</strong></div>
                                  {inst.breakdown.derechoSuscripcion && inst.breakdown.derechoSuscripcion > 0 ? (
                                    <div className="flex justify-between"><span>Derecho Suscripción (IVA incl.):</span><strong>{formatCurrency(inst.breakdown.derechoSuscripcion)}</strong></div>
                                  ) : (
                                      <div className="flex justify-between text-muted-foreground"><span>Derecho Suscripción:</span><strong>-</strong></div>
                                  )}
                                  <div className="flex justify-between"><span>Seguro de Vida:</span><strong>{formatCurrency(inst.breakdown.seguroVida)}</strong></div>
                                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total Estimado:</span><span>{formatCurrency(inst.total)}</span></div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
