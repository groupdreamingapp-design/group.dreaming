
'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGroups } from '@/hooks/use-groups';
import { generateStaticAwards } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX2, PiggyBank, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/app/stat-card';

export default function FinancialHealthPage() {
    const params = useParams();
    const groupId = typeof params.id === 'string' ? params.id : '';
    const { groups } = useGroups();
    
    const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);

    const groupAwards = useMemo(() => {
        if (!group) return [];
        return generateStaticAwards(group);
    }, [group]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    }
    
    const { collectionData, kpis } = useMemo(() => {
        if (!group || !group.activationDate || !group.monthsCompleted) {
            return { collectionData: [], kpis: {} };
        }

        const installments = Array.from({ length: group.monthsCompleted }, (_, i) => i);
        const alicuotaPura = group.capital / group.plazo;
        let accumulated = 0;
        let totalImpagos = 0;

        const collectionData = installments.map((_, i) => {
            const cuotaNumber = i + 1;
            
            const missedPaymentsThisMonth = (cuotaNumber === group.monthsCompleted) ? (group.missedPayments || 0) : 0;
            const membersWhoPaidThisMonth = group.totalMembers - missedPaymentsThisMonth;

            const monthlyAlicuotaPaid = alicuotaPura * membersWhoPaidThisMonth;
            
            const awardsThisMonth = groupAwards[i] || [];
            const licitacionWinner = awardsThisMonth.find(a => a.type === 'licitacion');
            
            const totalLicitaciones = licitacionWinner ? alicuotaPura * (Math.floor(Math.random() * 10) + 8) : 0;
            const totalAdelantos = (cuotaNumber > 2 && Math.random() > 0.8) ? alicuotaPura * (Math.floor(Math.random() * 5) + 2) : 0;
            
            const impagos = alicuotaPura * missedPaymentsThisMonth;
            totalImpagos += impagos;
            
            let adjudicadoDelMes = 0;
            if (cuotaNumber > 1) {
                 if (totalLicitaciones > 0) {
                    adjudicadoDelMes = group.capital * 2;
                } else {
                    adjudicadoDelMes = group.capital;
                }
            }

            accumulated = accumulated + monthlyAlicuotaPaid + totalLicitaciones + totalAdelantos - adjudicadoDelMes;

            return {
                cuotaNumber,
                totalAlicuota: monthlyAlicuotaPaid,
                totalLicitaciones,
                totalAdelantos,
                impagos,
                adjudicadoDelMes,
                acumulado: accumulated,
            };
        });

        const kpis = {
            totalAcumulado: accumulated,
            totalImpagos: totalImpagos,
            capitalNecesario: group.capital * 2,
        };
        
        return { collectionData, kpis };
    }, [group, groupAwards]);


    if (!group) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
            <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
            <Button asChild className="mt-4">
              <Link href="/panel/my-groups">Volver a Mis Grupos</Link>
            </Button>
          </div>
        );
    }

    if (group.status !== 'Activo') {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold">Página no disponible</h1>
                <p className="text-muted-foreground">La salud financiera solo está disponible para grupos activos.</p>
                <Button asChild className="mt-4">
                  <Link href={`/panel/group/${group.id}`}>Volver al Grupo</Link>
                </Button>
              </div>
        )
    }

    return (
        <>
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href={`/panel/group/${group.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Grupo
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Salud Financiera del Grupo</h1>
                <p className="text-muted-foreground">Un análisis del fondo general para adjudicaciones (Grupo {group.id}).</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard 
                    title="Fondo General Acumulado"
                    value={formatCurrency(kpis.totalAcumulado || 0)}
                    icon={PiggyBank}
                    description="Saldo actual del fondo para adjudicaciones."
                />
                 <StatCard 
                    title="Impagos Acumulados"
                    value={formatCurrency(kpis.totalImpagos || 0)}
                    icon={TrendingDown}
                    description="Se recupera vía subasta forzosa."
                />
                 <StatCard 
                    title="Capital Necesario Mensual"
                    value={formatCurrency(kpis.capitalNecesario || 0)}
                    icon={Target}
                    description="Monto para cubrir 2 adjudicaciones."
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tabla de Recaudación del Fondo General</CardTitle>
                    <CardDescription>Detalle de la capitalización del grupo mes a mes, incluyendo ingresos por alícuotas, licitaciones, adelantos y egresos por adjudicaciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº de Cuota</TableHead>
                                <TableHead className="text-right">Total Alícuota</TableHead>
                                <TableHead className="text-right">Total Licitaciones</TableHead>
                                <TableHead className="text-right">Total Adelantos</TableHead>
                                <TableHead className="text-right">Impagos</TableHead>
                                <TableHead className="text-right">Adjudicado</TableHead>
                                <TableHead className="text-right">Acumulado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collectionData.map((data) => (
                                <TableRow key={data.cuotaNumber}>
                                    <TableCell>{data.cuotaNumber}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(data.totalAlicuota)}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(data.totalLicitaciones)}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(data.totalAdelantos)}</TableCell>
                                    <TableCell className={`text-right font-medium ${data.impagos > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {formatCurrency(data.impagos)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-500">
                                        -{formatCurrency(data.adjudicadoDelMes)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(data.acumulado)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
