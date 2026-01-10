
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGroups } from '@/hooks/use-groups';
import { generateInstallments } from '@/lib/data';
import type { Installment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX2, Banknote, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { StatCard } from '@/components/app/stat-card';


export default function FinancialHealthPage() {
    const params = useParams();
    const groupId = typeof params.id === 'string' ? params.id : '';
    const { groups } = useGroups();
    
    const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);

    const formatCurrency = (amount: number, compact = false) => {
        if (compact) {
             return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
        }
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    }
    
    const chartData = useMemo(() => {
        if (!group || !group.activationDate) return [];

        const installments = generateInstallments(group.capital, group.plazo, group.activationDate);
        const paidInstallmentsCount = (group.monthsCompleted || 0) - (group.missedPayments || 0);

        return installments.slice(0, group.monthsCompleted).map(inst => {
            const isPaid = inst.number <= paidInstallmentsCount;
            const alicuotaPura = inst.breakdown.alicuotaPura;
            const membersWhoPaid = isPaid ? group.totalMembers : Math.floor(group.totalMembers * 0.95); // Simulate 95% payment for overdue
            const collected = alicuotaPura * membersWhoPaid;
            
            return {
                month: `Mes ${inst.number}`,
                recaudado: collected,
                esperado: alicuotaPura * group.totalMembers
            };
        });
    }, [group]);


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
    
    const totalCollected = chartData.reduce((acc, item) => acc + item.recaudado, 0);
    const totalExpectedSoFar = chartData.reduce((acc, item) => acc + item.esperado, 0);
    const collectionPercentage = totalExpectedSoFar > 0 ? (totalCollected / totalExpectedSoFar) * 100 : 0;
    const nextAwardCapital = group.capital * 2;


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

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <StatCard
                    title="Fondo General Recaudado"
                    value={formatCurrency(totalCollected)}
                    icon={Banknote}
                    description="Total de alícuotas puras pagadas a la fecha."
                />
                <StatCard
                    title="Próxima Adjudicación (Capital)"
                    value={formatCurrency(nextAwardCapital)}
                    icon={Target}
                    description={`El fondo debe tener ${formatCurrency(nextAwardCapital)} para el próximo acto.`}
                />
                 <StatCard
                    title="Progreso de Recaudación"
                    value={`${collectionPercentage.toFixed(2)}%`}
                    icon={TrendingUp}
                    description={`Se recaudó ${formatCurrency(totalCollected)} de ${formatCurrency(totalExpectedSoFar)} esperados.`}
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recaudación Mensual de Alícuotas Puras</CardTitle>
                    <CardDescription>
                        Visualización de los fondos recaudados cada mes para las adjudicaciones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{
                        recaudado: { label: "Recaudado", color: "hsl(var(--chart-1))" },
                        esperado: { label: "Esperado", color: "hsl(var(--muted))" },
                    }} className="h-[400px] w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis 
                                tickFormatter={(value) => formatCurrency(Number(value), true)}
                            />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="esperado" fill="var(--color-esperado)" radius={4} />
                            <Bar dataKey="recaudado" fill="var(--color-recaudado)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Tabla de Datos</CardTitle>
                    <CardDescription>Detalle de la recaudación mensual.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mes</TableHead>
                                <TableHead className="text-right">Recaudado</TableHead>
                                <TableHead className="text-right">Esperado</TableHead>
                                <TableHead className="text-right">Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {chartData.map((data, index) => (
                                <TableRow key={index}>
                                    <TableCell>{data.month}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.recaudado)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.esperado)}</TableCell>
                                    <TableCell className={`text-right font-medium ${data.recaudado < data.esperado ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatCurrency(data.recaudado - data.esperado)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
