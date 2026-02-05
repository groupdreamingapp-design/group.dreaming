'use client';

import { useMemo, useState, useEffect, Suspense, useRef } from "react";
import { useUser } from "@/firebase";
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
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const MAX_CAPITAL = 100000;

function DashboardContent() {
  const { user, isUserLoading: loading } = useUser();
  const { joinGroup, groups } = useGroups();
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsClient(true);

    const paymentStatus = searchParams.get('payment');
    const groupId = searchParams.get('groupId');

    if (loading) return; // Wait for auth to load

    if (paymentStatus === 'success' && groupId) {
      if (!user) {
        // ... existing redirect logic ...
        const currentUrl = window.location.href;
        const returnUrl = `/panel?payment=success&groupId=${groupId}`;
        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // Check if we already processed this group join in this session mount
      if (processedRef.current.has(groupId)) {
        return;
      }

      // Prevent double join if already member in local state
      const alreadyMember = groups.find(g => g.id === groupId)?.userIsMember;

      if (!alreadyMember) {
        processedRef.current.add(groupId); // Mark as processed
        joinGroup(groupId);
        // Toast is handled by joinGroup usually, but we can add specific payment success message
        toast({
          title: "¡Pago Exitoso!",
          description: `Te has unido correctamente al grupo ${groupId}.`,
          className: "bg-green-100 border-green-500 text-green-700"
        });
      }

      // Clean URL after processing is done (or if already member)
      // Use replace to remove query params so refresh doesn't trigger again
      router.replace('/panel');
    } else if (paymentStatus === 'failure') {
      // ... existing failure logic
      toast({
        title: "Pago Fallido",
        description: "No se pudo completar el pago de adhesión.",
        variant: "destructive"
      });
      router.replace('/panel');
    }

  }, [searchParams, joinGroup, groups, router, toast, user, loading]);

  const subscribedCapital = useMemo(() => {
    return groups
      .filter(g => g.userIsMember && (g.status === 'Activo' || g.status === 'Abierto'))
      .reduce((acc, g) => acc + g.capital, 0);
  }, [groups]);


  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember).sort((a, b) => {
    const statusOrder = { "Activo": 1, "Abierto": 2, "Subastado": 3, "Cerrado": 4 };
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
    if (group.status === 'Subastado' && group.monthsCompleted) {
      return (group.monthsCompleted / group.plazo) * 100;
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
    if (group.status === 'Subastado' && group.monthsCompleted) {
      return `${group.monthsCompleted} de ${group.plazo} cuotas completadas`;
    }
    return `Finalizado`;
  }

  const getStatusVariant = (status: Group['status']) => {
    switch (status) {
      case "Activo": return "default";
      case "Abierto": return "secondary";
      case "Subastado": return "destructive";
      case "Cerrado": return "destructive";
      default: return "default";
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Hola, {user?.displayName?.split(' ')[0] || 'Usuario'}!</h1>

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

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
