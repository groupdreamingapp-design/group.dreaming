
'use client';

import { user, transactions, groups } from "@/lib/data"
import { StatCard } from "@/components/app/stat-card"
import { Repeat, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupCard } from "@/components/app/group-card"

export default function DashboardPage() {

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const availableBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const myGroups = groups.filter(g => g.userIsMember);
  const activeGroups = myGroups.filter(g => g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente');
  const closedGroups = myGroups.filter(g => g.status === 'Cerrado');

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
            <CardTitle>Mis Grupos</CardTitle>
            <CardDescription>Un resumen de todos tus planes de ahorro colectivo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                <TabsTrigger value="activos">Activos</TabsTrigger>
                <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
              </TabsList>
              <TabsContent value="activos">
                  {activeGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                          {activeGroups.map(group => (
                              <GroupCard key={group.id} group={group} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-16 text-muted-foreground">
                          <p>Aún no te has unido a ningún grupo.</p>
                          <p>¡Explora los grupos disponibles y empieza a cumplir tus sueños!</p>
                      </div>
                  )}
              </TabsContent>
              <TabsContent value="finalizados">
                  {closedGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                          {closedGroups.map(group => (
                              <GroupCard key={group.id} group={group} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-16 text-muted-foreground">
                          <p>No tienes grupos finalizados.</p>
                      </div>
                  )}
              </TabsContent>
            </Tabs>
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
