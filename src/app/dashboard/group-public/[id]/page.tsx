
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGroups } from '@/hooks/use-groups';
import { generateExampleInstallments } from '@/lib/data';
import type { Installment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Users, Clock, Scale, Users2, FileX2, CheckCircle, Ticket, HandCoins } from 'lucide-react';
import Link from 'next/link';

export default function GroupPublicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { groups, joinGroup } = useGroups();
  
  const groupId = typeof params.id === 'string' ? params.id : '';
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/explore">Volver a Explorar</Link>
        </Button>
      </div>
    );
  }

  const exampleInstallments = generateExampleInstallments(group.capital, group.plazo);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const handleJoinGroup = () => {
    joinGroup(group.id);
    router.push(`/dashboard/group/${group.id}`);
  };

  return (
    <>
      <div className="mb-4">
        <Link href="/dashboard/explore" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Explorar
        </Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">{formatCurrency(group.capital)}</h1>
                <p className="text-muted-foreground">en {group.plazo} meses (Grupo {group.id})</p>
            </div>
            <Button onClick={handleJoinGroup} size="lg">
                <CheckCircle className="mr-2" /> Unirme a este grupo
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
             <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Datos clave sobre este plan de ahorro.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>Miembros: <strong>{group.membersCount}/{group.totalMembers}</strong></span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>Plazo: <strong>{group.plazo} meses</strong></span></div>
                    <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /><span>Cuota Promedio: <strong>{formatCurrency(group.cuotaPromedio)}</strong></span></div>
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span>Adjudicaciones:</span>
                      <strong className="flex items-center gap-1.5">
                        1<Ticket className="h-4 w-4 text-blue-500" />
                        <span className="sr-only">Sorteo</span>
                        + 1<HandCoins className="h-4 w-4 text-orange-500" />
                        <span className="sr-only">Licitación</span>
                      </strong>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Plan de Cuotas (Ejemplo)</CardTitle>
              <CardDescription>Así se compone tu cuota mensual. Los valores son aproximados.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {exampleInstallments.slice(0, 12).map((inst: Installment) => (
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
                   {exampleInstallments.length > 12 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                            ... y {exampleInstallments.length - 12} cuotas más.
                        </TableCell>
                    </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
