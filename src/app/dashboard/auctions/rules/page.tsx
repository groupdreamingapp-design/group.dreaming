
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users } from "lucide-react";
import Link from "next/link";

const rulesConfig = [
    {
        title: "Publicación y Precio Base",
        icon: FileText,
        points: [
            "El vendedor publica su plan en subasta. El precio base se establece a partir del total de cuotas emitidas (incluyendo todos los conceptos), menos un 50%.",
            "Una vez concretada la venta, del monto final a liquidar al vendedor se deduce cualquier concepto pendiente para entregar el plan libre de deudas, además de la comisión por venta (2% + IVA)."
        ]
    },
    {
        title: "Proceso de Oferta y Garantía de Venta",
        icon: ShieldCheck,
        points: [
            "Los compradores realizan ofertas durante el plazo de la subasta. Al ganar, el comprador tiene 24 horas para integrar el capital ofertado más la comisión de compra (2% + IVA).",
            "Si el comprador no concreta el pago, el plan se vuelve a subastar y el comprador es bloqueado hasta que pague una multa del 10% + IVA sobre la oferta realizada.",
            "Si un plan no recibe ofertas, la plataforma garantiza su compra al precio base, asegurando una liquidación para el vendedor."
        ]
    },
    {
        title: "Fondo de Reserva y Sostenibilidad",
        icon: Landmark,
        points: [
            "Para financiar la garantía de compra, la plataforma genera un fondo de reserva en cada grupo, compuesto por el 50% de los ingresos del \"Derecho de Suscripción\" y el 50% de los \"Gastos Administrativos\".",
            "Cuando la plataforma absorbe un plan, utiliza este fondo para cubrir las cuotas mensuales, asegurando que el capital del grupo se complete para todos los miembros."
        ]
    },
    {
        title: "Para el Comprador",
        icon: Users,
        points: [
            "Al ganar la subasta, el comprador debe abonar únicamente el monto ofertado para concretar la adquisición del plan.",
            "La comisión de compra (2% + IVA) será descontada del capital que reciba al momento de resultar adjudicado en el futuro."
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
