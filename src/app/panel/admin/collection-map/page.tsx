
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

const collectionData = [
    {
        user: "Juan Pérez",
        group: "ID-20250806-TEST",
        quota: "05/24",
        method: "SIRO (CBU)",
        status: "Cobrado",
    },
    {
        user: "Ana López",
        group: "ID-20250806-TEST",
        quota: "05/24",
        method: "SIRO (CBU)",
        status: "Reintento",
    },
    {
        user: "Luis Sosa",
        group: "ID-20250806-TEST",
        quota: "05/24",
        method: "Tarjeta de Débito",
        status: "Rechazado",
    },
    {
        user: "Marta Díaz",
        group: "ID-20250501-AWRD",
        quota: "12/12",
        method: "Rapipago",
        status: "Pendiente",
    },
    {
        user: "Carlos Garcia",
        group: "ID-20241101-ABCD",
        quota: "01/48",
        method: "SIRO (CBU)",
        status: "Cobrado",
    }
];

const kpiData = {
    all: {
        recaudacion: { value: "$84,500 / $102,000", description: "82.8% del objetivo recaudado" },
        cobrabilidad: { value: "91.5%", description: "102 de 111 usuarios pagaron" },
        reserva: { value: "$12,350.50", description: "Disponible para cubrir moras" },
        adjudicacion: { value: "Ver por grupo", description: "Seleccione un grupo para ver" },
        ingresos: { value: "$4,225", description: "Ingresos totales del mes" },
        rendimientoFloat: { value: "$1,150", description: "Cubre 75% de seguros del mes" },
    },
    "ID-20250806-TEST": {
        recaudacion: { value: "$40,000 / $48,000", description: "83.3% del objetivo" },
        cobrabilidad: { value: "90%", description: "45 de 50 usuarios" },
        reserva: { value: "$6,500.00", description: "Fondo específico del grupo" },
        adjudicacion: { value: "25 de Julio, 2024", description: "Sorteo y Licitación G-001" },
        ingresos: { value: "$2,000", description: "Ingresos del grupo" },
        rendimientoFloat: { value: "$550", description: "Cubre 78% de seguros del mes" },
    },
    "ID-20250501-AWRD": {
        recaudacion: { value: "$24,500 / $30,000", description: "81.6% del objetivo" },
        cobrabilidad: { value: "92%", description: "23 de 25 usuarios" },
        reserva: { value: "$3,850.50", description: "Fondo específico del grupo" },
        adjudicacion: { value: "26 de Julio, 2024", description: "Sorteo y Licitación G-002" },
        ingresos: { value: "$1,225", description: "Ingresos del grupo" },
        rendimientoFloat: { value: "$350", description: "Cubre 72% de seguros del mes" },
    },
    "ID-20241101-ABCD": {
        recaudacion: { value: "$20,000 / $24,000", description: "83.3% del objetivo" },
        cobrabilidad: { value: "95%", description: "34 de 36 usuarios" },
        reserva: { value: "$2,000.00", description: "Fondo específico del grupo" },
        adjudicacion: { value: "27 de Julio, 2024", description: "Sorteo y Licitación G-003" },
        ingresos: { value: "$1,000", description: "Ingresos del grupo" },
        rendimientoFloat: { value: "$250", description: "Cubre 70% de seguros del mes" },
    }
};

const statusStyles: { [key: string]: string } = {
    "Cobrado": "bg-green-100 text-green-800 border-green-200",
    "Reintento": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Rechazado": "bg-red-100 text-red-800 border-red-200",
    "Pendiente": "bg-blue-100 text-blue-800 border-blue-200",
};

export default function CollectionMap() {
    const [selectedGroup, setSelectedGroup] = useState('all');

    const groupFilterOptions = useMemo(() => Object.keys(kpiData).filter(key => key !== 'all'), []);
    
    const currentKpis = useMemo(() => {
        return kpiData[selectedGroup as keyof typeof kpiData] || kpiData.all;
    }, [selectedGroup]);

    const filteredCollectionData = useMemo(() => {
        if (selectedGroup === 'all') {
            return collectionData;
        }
        return collectionData.filter(item => item.group === selectedGroup);
    }, [selectedGroup]);

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
                         <Select value={selectedGroup} onValueChange={setSelectedGroup}>
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
                            {filteredCollectionData.map((item, index) => (
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
