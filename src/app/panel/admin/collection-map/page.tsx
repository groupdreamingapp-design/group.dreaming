
'use client';

import { useMemo, useState } from 'react';
import { StatCard } from "@/components/app/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowLeft, Banknote, CalendarClock, CheckCircle, Percent, Phone, RefreshCw, Shield, TrendingUp, Wallet, Waves } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/firebase/firestore/use-collection';



const kpiData = {
    all: {
        recaudacion: { value: "$0 / $0", description: "0% del objetivo recaudado" },
        cobrabilidad: { value: "0%", description: "0 de 0 usuarios pagaron" },
        reserva: { value: "$0.00", description: "Disponible para cubrir moras" },
        adjudicacion: { value: "-", description: "Sin adjudicaciones pendientes" },
        ingresos: { value: "$0", description: "Ingresos totales del mes" },
        rendimientoFloat: { value: "$0", description: "Cubre 0% de seguros del mes" },
    },
};

const statusStyles: { [key: string]: string } = {
    "Cobrado": "bg-green-100 text-green-800 border-green-200",
    "Reintento": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Rechazado": "bg-red-100 text-red-800 border-red-200",
    "Pendiente": "bg-blue-100 text-blue-800 border-blue-200",
};

export default function CollectionMap() {
    const [selectedGroup, setSelectedGroup] = useState('all');

    // Fetch users from Firebase
    const { data: users, isLoading } = useCollection('users');

    const collectionData = useMemo(() => {
        if (!users) return [];
        return users.map((u: any) => ({
            user: u.displayName || u.email || 'Usuario',
            group: u.group || '-', // Assuming user might have a group field, or defaulting
            quota: u.quota || '-',
            method: u.method || '-',
            status: u.status || 'Pendiente',
            id: u.id
        }));
    }, [users]);

    const groupFilterOptions = useMemo(() => Object.keys(kpiData).filter(key => key !== 'all'), []);

    const currentKpis = useMemo(() => {
        return kpiData[selectedGroup as keyof typeof kpiData] || kpiData.all;
    }, [selectedGroup]);

    const filteredCollectionData = useMemo(() => {
        let data = collectionData;
        if (selectedGroup !== 'all') {
            data = data.filter((item: any) => item.group === selectedGroup);
        }
        return data;
    }, [selectedGroup, collectionData]);

    return (
        <>
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                    <Link href="/panel/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Administración
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                            <Waves className="h-8 w-8 text-primary" />
                            Mapa de Cobranza
                        </h1>
                        <p className="text-muted-foreground">Estado de la recaudación mensual y conciliación.</p>
                    </div>
                    <div className="w-full md:w-auto min-w-[250px]">
                        <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={groupFilterOptions.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los grupos</SelectItem>
                                {groupFilterOptions.map(groupId => (
                                    <SelectItem key={groupId} value={groupId}>{groupId}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                <StatCard
                    title="Recaudación del Mes"
                    value={currentKpis.recaudacion.value}
                    icon={Banknote}
                    description={currentKpis.recaudacion.description}
                />
                <StatCard
                    title="Tasa de Cobrabilidad"
                    value={currentKpis.cobrabilidad.value}
                    icon={Percent}
                    description={currentKpis.cobrabilidad.description}
                />
                <StatCard
                    title="Rendimiento de Float"
                    value={currentKpis.rendimientoFloat.value}
                    icon={TrendingUp}
                    description={currentKpis.rendimientoFloat.description}
                />
                <StatCard
                    title="Fondo de Reserva"
                    value={currentKpis.reserva.value}
                    icon={Shield}
                    description={currentKpis.reserva.description}
                />
                <StatCard
                    title="Ingresos de la Plataforma"
                    value={currentKpis.ingresos.value}
                    icon={Wallet}
                    description={currentKpis.ingresos.description}
                />
                <StatCard
                    title="Próxima Adjudicación"
                    value={currentKpis.adjudicacion.value}
                    icon={CalendarClock}
                    description={currentKpis.adjudicacion.description}
                />
            </div>

            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Detalle de Cobranzas del Mes</CardTitle>
                        <CardDescription>Esta tabla se alimenta de los webhooks y archivos de conciliación de los proveedores de pago.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Cuota</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCollectionData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No hay datos de cobranza disponibles.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCollectionData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.user}</TableCell>
                                        <TableCell>{item.group}</TableCell>
                                        <TableCell>{item.quota}</TableCell>
                                        <TableCell>{item.method}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(statusStyles[item.status])}>
                                                {item.status === "Cobrado" && <CheckCircle className="mr-1 h-3 w-3" />}
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status === "Cobrado" ? (
                                                <Button variant="outline" size="sm">Ver Comprobante</Button>
                                            ) : item.status === "Reintento" ? (
                                                <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50">
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Avisar x WhatsApp
                                                </Button>
                                            ) : item.status === "Rechazado" ? (
                                                <Button variant="destructive" size="sm">
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Cambiar Método
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
