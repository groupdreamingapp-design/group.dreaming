'use client';

import { StatCard } from "@/components/app/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowLeft, Banknote, CalendarClock, CheckCircle, Percent, Phone, RefreshCw, Shield, WalletCards, Waves } from "lucide-react";
import Link from "next/link";


const collectionData = [
    {
        user: "Juan Pérez",
        group: "G-001",
        quota: "05/24",
        method: "SIRO (CBU)",
        status: "Cobrado",
    },
    {
        user: "Ana López",
        group: "G-001",
        quota: "05/24",
        method: "SIRO (CBU)",
        status: "Reintento",
    },
    {
        user: "Luis Sosa",
        group: "G-001",
        quota: "05/24",
        method: "Tarjeta de Débito",
        status: "Rechazado",
    },
    {
        user: "Marta Díaz",
        group: "G-002",
        quota: "12/12",
        method: "Rapipago",
        status: "Pendiente",
    },
    {
        user: "Carlos Garcia",
        group: "G-003",
        quota: "01/48",
        method: "SIRO (CBU)",
        status: "Cobrado",
    }
];

const statusStyles: { [key: string]: string } = {
    "Cobrado": "bg-green-100 text-green-800 border-green-200",
    "Reintento": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Rechazado": "bg-red-100 text-red-800 border-red-200",
    "Pendiente": "bg-blue-100 text-blue-800 border-blue-200",
};


export default function CollectionMap() {
    return (
        <>
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                    <Link href="/panel/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Administración
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <Waves className="h-8 w-8 text-primary" />
                    Mapa de Cobranza
                </h1>
                <p className="text-muted-foreground">Estado de la recaudación mensual y conciliación.</p>
            </div>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                    title="Recaudación del Mes"
                    value="$84,500 / $102,000"
                    icon={Banknote}
                    description="82.8% del objetivo recaudado"
                />
                <StatCard
                    title="Tasa de Cobrabilidad"
                    value="91.5%"
                    icon={Percent}
                    description="102 de 111 usuarios pagaron"
                />
                <StatCard
                    title="Fondo de Reserva Actual"
                    value="$12,350.50"
                    icon={Shield}
                    description="Disponible para cubrir moras"
                />
                <StatCard
                    title="Próxima Adjudicación"
                    value="25 de Julio, 2024"
                    icon={CalendarClock}
                    description="Sorteo y Licitación G-002"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Cobranzas del Mes</CardTitle>
                    <CardDescription>Esta tabla se alimenta de los webhooks y archivos de conciliación de los proveedores de pago.</CardDescription>
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
                            {collectionData.map((item, index) => (
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
