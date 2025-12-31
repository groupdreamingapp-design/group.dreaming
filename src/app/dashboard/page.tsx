
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
import { GroupCard } from "@/components/app/group-card"
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { groups } = useGroups();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);

  const availableBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember), [groups]);
  const activeGroups = useMemo(() => myGroups.filter(g => g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente'), [myGroups]);

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Hola, {user.name.split(' ')[0]}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Saldo Disponible" value={formatCurrency(availableBalance)} icon={Wallet} description="+20% que el mes pasado" />
        <StatCard title="Próxima Cuota" value={formatCurrency(615)} icon={Repeat} description="Vence en 15 días" />
        <StatCard title="Grupos Activos" value={activeGroups.length.toString()} icon={Users} description={`${myGroups.filter(g => g.userIsAwarded).length} adjudicado(s)`} />
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mis Grupos Activos</CardTitle>
            <CardDescription>Un resumen de tus planes de ahorro colectivo activos.</CardDescription>
          </CardHeader>
          <CardContent>
              {activeGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                      {activeGroups.map(group => (
                          <GroupCard key={group.id} group={group} />
                      ))}
                  </div>
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

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
            <CardDescription>Tus transacciones más recientes en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{tx.date}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{tx.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tx.date}</TableCell>
                    <TableCell className={cn("text-right", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
