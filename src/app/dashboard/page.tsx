
'use client';

import { useMemo } from "react";
import { user, transactions } from "@/lib/data"
import { useGroups } from "@/hooks/use-groups";
import { Repeat, Wallet, PieChart, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Group } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const MAX_CAPITAL = 100000;

export default function DashboardPage() {
  const { groups } = useGroups();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const availableBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember).sort((a, b) => {
    const statusOrder = { "Activo": 1, "Abierto": 2, "Pendiente": 3, "Subastado": 4, "Cerrado": 5 };
    return statusOrder[a.status] - statusOrder[b.status];
  }), [groups]);

  const activeGroups = useMemo(() => myGroups.filter(g => g.status === 'Activo'), [myGroups]);

  const subscribedCapital = useMemo(() => {
    return groups
        .filter(g => g.userIsMember && (g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente'))
        .reduce((acc, g) => acc + g.capital, 0);
  }, [groups]);

  const availableToSubscribe = MAX_CAPITAL - subscribedCapital;


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
      case "Subastado": return "destructive";
      case "Cerrado": return "destructive";
      default: return "default";
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Hola, {user.name.split(' ')[0]}!</h1>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Disponible</p>
                    <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                 {activeGroups.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <Repeat className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Próxima Cuota</p>
                        <p className="text-2xl font-bold">{formatCurrency(615)}</p>
                        <p className="text-xs text-muted-foreground">Vence en 15 días</p>
                      </div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-4 rounded-lg bg-muted p-4 h-full">
                        <Info className="h-8 w-8 text-muted-foreground" />
                         <div>
                            <p className="text-sm font-semibold">Todo listo para empezar</p>
                            <p className="text-xs text-muted-foreground">Aún no tienes cuotas a pagar. ¡Únete a un grupo para comenzar!</p>
                        </div>
                    </div>
                 )}
              </div>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cupo de Capital Disponible</p>
                    <p className="text-2xl font-bold">{formatCurrency(availableToSubscribe)}</p>
                    <p className="text-xs text-muted-foreground">Total: {formatCurrency(MAX_CAPITAL)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                                        group.status === 'Subastado' && 'bg-orange-500/20 text-orange-700 border-orange-500/30',
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
