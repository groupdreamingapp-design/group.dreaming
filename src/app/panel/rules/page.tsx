
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users, Repeat, Scaling, UserCheck, Banknote, Gavel, FileX, Handshake, CalendarPlus } from "lucide-react";
import Link from "next/link";

const platformRules = [
    {
        title: "Requisitos de Participación",
        icon: UserCheck,
        points: [
            "El registro simple te permite explorar la plataforma.",
            "Para unirte a un grupo, licitar o participar en subastas, es obligatoria la Verificación de Identidad (KYC).",
            "El pago de la primera cuota es obligatorio para confirmar la adhesión a un grupo.",
            "Es necesario designar un beneficiario para el seguro de vida colectivo.",
        ]
    },
    {
        title: "Activación de Grupo y Cobranza",
        icon: CalendarPlus,
        points: [
            "Un grupo se 'Activa' cuando el último miembro se une y abona su primera cuota.",
            "La segunda cuota de TODOS los miembros vencerá el día 10 del mes siguiente a la activación del grupo.",
            "Las cuotas subsiguientes vencerán los días 10 de cada mes, y los actos de adjudicación se realizarán los días 15.",
        ]
    },
    {
        title: "Ingreso de Fondos",
        icon: Banknote,
        points: [
            "Todo método de pago asociado (CBU/CVU, tarjeta) debe pertenecer al titular de la cuenta en la plataforma.",
            "La titularidad se valida contrastando el CUIT/CUIL del titular de la cuenta con el del método de pago.",
            "No se permite el ingreso de fondos desde cuentas de terceros para cumplir con normativas de prevención de lavado de activos.",
        ]
    },
    {
        title: "Propuestas de Licitación",
        icon: Gavel,
        points: [
            "Puedes licitar para acelerar tu adjudicación ofreciendo adelantar cuotas. La oferta mínima es de 1 cuota y la máxima es el total de cuotas futuras pendientes.",
            "La oferta se realiza con el valor de la 'alícuota pura', ahorrando en gastos administrativos.",
            "PRIORIDAD DE LA PLATAFORMA: Si la administradora posee un plan (por baja o subasta desierta), licitará automáticamente por el máximo, ganando la adjudicación para inyectar liquidez al grupo.",
            "En caso de ganar, debes integrar el capital ofertado en el plazo estipulado. De lo contrario, se aplican penalidades.",
        ]
    },
    {
        title: "Adelanto de Cuotas",
        icon: Scaling,
        points: [
            "Puedes adelantar las últimas cuotas de tu plan en cualquier momento.",
            "Al adelantar, solo pagas la 'alícuota pura', obteniendo un descuento significativo.",
            "El adelanto de cuotas no compite por la adjudicación, simplemente acorta el plazo de tu plan.",
        ]
    },
    {
        title: "Subastas (Mercado Secundario)",
        icon: Repeat,
        points:
        [
            "Puedes vender tu plan a partir de la 3ra cuota paga.",
            "La base se estipula automaticamente sobre el 50% de las cuotas totales emitidas ya que la plataforma de ahí podrá cobrarse los impagos y la comision correspondiente.",
            "Un plan adquirido en subasta no puede volver a ser subastado, brindando estabilidad al sistema."
        ]
    },
     {
        title: "Baja de un Plan",
        icon: FileX,
        points:
        [
            "Si el grupo no se activa después de 60 días desde tu adhesión, puedes solicitar la 'Cancelación por Demora' y recibir el reintegro total e inmediato de tu primera cuota.",
            "Puedes solicitar la 'Baja Voluntaria' de un plan no adjudicado. Se te devolverá el total de las 'alícuotas puras' que hayas pagado al finalizar el ciclo del grupo.",
            "A la devolución por Baja Voluntaria se le aplica una penalidad administrativa, según el contrato."
        ]
    },
    {
        title: "Obligaciones en la Adjudicación",
        icon: Handshake,
        points:
        [
            "Si ganas por licitación, es obligatorio integrar el capital ofertado en el plazo establecido.",
            "Previo a la entrega del capital (por sorteo o licitación), debes presentar las garantías requeridas por la administradora.",
            "Las garantías son flexibles: puedes optar por un accesible Seguro de Caución, una garantía propietaria, o presentar recibos de sueldo que demuestren solvencia.",
        ]
    }
];

export default function RulesPage() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/panel">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Reglamento de Participación</h1>
                <p className="text-muted-foreground">Las reglas claras que hacen posible nuestro sistema de confianza y ayuda mutua.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {platformRules.map((rule, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <rule.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{rule.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                {rule.points.map((point, pIndex) => (
                                    <li key={pIndex} className="flex items-start gap-3">
                                        <BadgePercent className="h-4 w-4 mt-1 text-primary shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
