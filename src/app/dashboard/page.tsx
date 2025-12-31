
'use client';

import { useMemo } from "react";
import { user, transactions } from "@/lib/data"
import { useGroups } from "@/hooks/use-groups";
import { StatCard } from "@/components/app/stat-card"
import { Repeat, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Group } from "@/lib/types";

export default function DashboardPage() {
  const { groups } = useGroups();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const availableBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember).sort((a, b) => {
    const statusOrder = { "Activo": 1, "Abierto": 2, "Pendiente": 3, "Cerrado": 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  }), [groups]);

  const getProgress = (group: Group) => {
    if (group.status === 'Activo' && group.monthsCompleted) {
      return (group.monthsCompleted / group.plazo) * 100;
    }
    if (group.status === 'Abierto') {
      return (group.membersCount / group.totalMembers) * 100;
    }
    if (group.status === 'Cerrado') {
      return 100;
    }
    return 0;
  }
  
  const getProgressText = (group: Group) => {
    if (group.status === 'Activo' && group.monthsCompleted) {
      return `${group.monthsCompleted} de ${group.plazo} meses`;
    }
    if (group.status === 'Abierto') {
      return `${group.membersCount} de ${group.totalMembers} miembros`;
    }
    return `Finalizado`;
  }

  const getStatusVariant = (status: Group['status']) => {
    switch (status) {
      case "Activo": return "default";
      case "Abierto": return "secondary";
      case "Pendiente": return "outline";
      case "Cerrado": return "destructive";
      default: return "default";
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Hola, {user.name.split(' ')[0]}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Saldo Disponible" value={formatCurrency(availableBalance)} icon={Wallet} description="+20% que el mes pasado" />
        <StatCard title="Próxima Cuota" value={formatCurrency(615)} icon={Repeat} description="Vence en 15 días" />
        <StatCard title="Grupos Activos" value={myGroups.filter(g => g.status === 'Activo' || g.status === 'Abierto').length.toString()} icon={Users} description={`${myGroups.length} en total`} />
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mis Grupos</CardTitle>
            <CardDescription>Un resumen de todos tus planes de ahorro colectivo.</CardDescription>
          </CardHeader>
          <CardContent>
            {myGroups.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Capital</TableHead>
                        <TableHead>Plazo</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myGroups.map(group => (
                            <TableRow key={group.id}>
                                <TableCell className="font-medium">{group.id}</TableCell>
                                <TableCell>{formatCurrency(group.capital)}</TableCell>
                                <TableCell>{group.plazo} meses</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Progress value={getProgress(group)} className="h-2" />
                                        <span className="text-xs text-muted-foreground">{getProgressText(group)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(group.status)}
                                    className={cn(
                                        group.status === 'Activo' && 'bg-green-500/20 text-green-700 border-green-500/30',
                                        group.status === 'Abierto' && 'bg-blue-500/20 text-blue-700 border-blue-500/30',
                                        group.status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                                    )}
                                    >{group.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/group/${group.id}`}>Ver Detalles</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                    <p>Aún no te has unido a ningún grupo.</p>
                    <Button asChild>
                    <Link href="/dashboard/explore">
                        ¡Explora los grupos disponibles y empieza a cumplir tus sueños!
                    </Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
