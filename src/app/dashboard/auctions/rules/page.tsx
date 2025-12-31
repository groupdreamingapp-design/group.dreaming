
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users } from "lucide-react";
import Link from "next/link";

const rulesConfig = [
    {
        title: "Publicación y Precio Base",
        icon: FileText,
        points: [
            "El vendedor publica su plan en subasta. Se establece un precio base, que considera el total de cuotas puras abonadas menos una deducción del 40%, más una comisión del 2% (+IVA).",
            "La comisión del vendedor (2% + IVA) se descuenta del monto final de la venta."
        ]
    },
    {
        title: "Proceso de Oferta y Garantía de Venta",
        icon: ShieldCheck,
        points: [
            "Los compradores interesados realizan ofertas por el plan durante un plazo de 48 horas.",
            "Al ganar una subasta, el comprador tiene 24 horas para integrar el capital ofertado en su wallet.",
            "Si un plan no recibe ninguna oferta al finalizar el plazo, la plataforma absorberá el plan, abonando al vendedor el precio base de subasta. Esto garantiza una liquidación segura para el vendedor y la integridad del grupo."
        ]
    },
    {
        title: "Fondo de Reserva y Sostenibilidad",
        icon: Landmark,
        points: [
            "Para financiar esta garantía, la plataforma genera un fondo de reserva en cada grupo, compuesto por el 50% de los ingresos del \"Derecho de Suscripción\" y el 50% de los \"Gastos Administrativos\".",
            "Cuando la plataforma absorbe un plan, utiliza este fondo para cubrir las cuotas mensuales a valor de alícuota pura, asegurando que el capital del grupo se complete para todos los miembros."
        ]
    },
    {
        title: "Para el Comprador",
        icon: Users,
        points: [
            "La comisión de compra (2% + IVA) se descontará del capital que reciba al momento de resultar adjudicado en el futuro.",
        ]
    }
];

export default function AuctionRulesPage() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/dashboard/auctions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Subastas
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Reglamento de Subastas</h1>
                <p className="text-muted-foreground">Normativa del Mercado Secundario de Group Dreaming.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {rulesConfig.map((rule, index) => (
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
