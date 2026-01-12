
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users, Repeat } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useEffect } from "react";

const complianceSections = [
    {
        title: "1. Marco Regulatorio y Naturaleza Jurídica",
        content: [
            "La Sociedad desarrolla su actividad bajo la figura de Administradora de Mandatos. Se deja constancia que Group Dreaming S.A.S.:",
            "No realiza intermediación financiera: Los fondos gestionados pertenecen exclusivamente a los suscriptores y están destinados a fines específicos (Adjudicaciones).",
            "Ausencia de captación de depósitos: La plataforma no ofrece rentabilidad garantizada ni captación de ahorros del público para uso propio de la firma, operando bajo un contrato de mandato conforme al Código Civil y Comercial de la Nación."
        ]
    },
    {
        title: "2. Prevención de Lavado de Activos y Financiamiento del Terrorismo (PLA/FT)",
        content: [
            "En cumplimiento con las disposiciones de la UIF (Unidad de Información Financiera), la Sociedad implementa los siguientes controles:",
            "KYC (Know Your Customer): Validación de identidad biométrica y verificación de documentación respaldatoria para todos los suscriptores.",
            "Trazabilidad Bancaria: El 100% de las transacciones se realizan a través de canales bancarios oficiales (SIRO / Banco Roela), eliminando el uso de efectivo y garantizando el origen lícito de los fondos."
        ]
    },
    {
        title: "3. Mitigación de Riesgo de Crédito e Incobrabilidad",
        content: [
            "Para garantizar la integridad de los fondos de los círculos de ahorro (de 24 a 240 miembros), se han establecido tres niveles de blindaje:",
            "Seguro de Caución Obligatorio: Todo suscriptor adjudicado que no presente garantía real debe contratar una póliza de caución por saldo deudor, asegurando el flujo de fondos ante eventuales impagos.",
            "Seguro de Vida Colectivo: Protección del grupo ante el fallecimiento de un suscriptor, cancelando el saldo deudor mediante la indemnización de la aseguradora.",
            "Fondo de Reserva: Constitución de un patrimonio de afectación derivado de gastos administrativos para cubrir contingencias operativas menores."
        ]
    },
    {
        title: "4. Seguridad de la Información y Algoritmos de Adjudicación",
        content: [
            "La Sociedad garantiza la transparencia de sus procesos mediante:",
            "Inmutabilidad de Datos: Uso de snapshots persistidos en base de datos al momento de la activación del grupo.",
            "Algoritmos Deterministas: El proceso de adjudicación se rige por software auditable basado en semillas (seeds) inalterables, eliminando cualquier posibilidad de manipulación manual de los ganadores."
        ]
    }
];

export default function CompliancePage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/panel/compliance');
        }
    }, [user, loading, router]);
    
    if (loading || user) {
        return <div className="flex justify-center items-center h-full">Cargando...</div>;
    }

    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Marco Legal y de Cumplimiento</h1>
                <p className="text-muted-foreground">Declaración de Cumplimiento Regulatorio y Gestión de Riesgos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>GROUP DREAMING S.A.S.</CardTitle>
                    <CardDescription>
                        REF: DECLARACIÓN DE CUMPLIMIENTO REGULATORIO Y GESTIÓN DE RIESGOS
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {complianceSections.map((section, index) => (
                        <div key={index}>
                            <h2 className="font-semibold text-lg mb-3">{section.title}</h2>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                     <div className="pt-6 border-t mt-6">
                        <p className="font-semibold">Atentamente,</p>
                        <p>W. Orlando Correa</p>
                        <p className="text-sm text-muted-foreground">Administrador Titular</p>
                        <p className="text-sm text-muted-foreground">Group Dreaming S.A.S.</p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
