
'use client';

import { useMemo, useState, useEffect } from "react";
import { user } from "@/lib/data"
import { useGroups } from "@/hooks/use-groups";
import { Repeat, Wallet, PieChart, Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Group } from "@/lib/types";

const MAX_CAPITAL = 100000;

export default function Dashboard() {
  const { groups } = useGroups();
  const [subscribedCapital, setSubscribedCapital] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const capital = groups
        .filter(g => g.userIsMember && (g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente'))
        .reduce((acc, g) => acc + g.capital, 0);
    setSubscribedCapital(capital);
  }, [groups]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember).sort((a, b) => {
    const statusOrder = { "Activo": 1, "Abierto": 2, "Pendiente": 3, "Subastado": 4, "Cerrado": 5 };
    return statusOrder[a.status] - statusOrder[b.status];
  }), [groups]);

  const availableToSubscribe = MAX_CAPITAL - subscribedCapital;
  const usedCapitalPercentage = (subscribedCapital / MAX_CAPITAL) * 100;


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
      
       <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupo Máximo de Capital a Suscribir</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {!isClient ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                     <Progress value={usedCapitalPercentage} />
                     <div className="grid grid-cols-3 text-xs">
                        <div><span className="font-semibold">Utilizado:</span> {formatCurrency(subscribedCapital)}</div>
                        <div className="text-center"><span className="font-semibold">Disponible:</span> {formatCurrency(availableToSubscribe)}</div>
                        <div className="text-right"><span className="font-semibold">Total:</span> {formatCurrency(MAX_CAPITAL)}</div>
                     </div>
                </div>
              )}
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
                                    <Badge 
                                      variant="outline"
                                      className={cn(
                                        "border-transparent text-white",
                                        group.status === 'Pendiente' && 'bg-yellow-500',
                                        group.status === 'Activo' && 'bg-green-600',
                                        group.status === 'Abierto' && 'bg-blue-600',
                                        group.status === 'Subastado' && 'bg-orange-600',
                                        group.status === 'Cerrado' && 'bg-gray-600'
                                    )}
                                    >{group.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/panel/group/${group.id}`}>Ver Detalles</Link>
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
                    <Link href="/panel/explore">
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
