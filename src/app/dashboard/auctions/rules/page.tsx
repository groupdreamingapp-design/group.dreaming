
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users } from "lucide-react";
import Link from "next/link";

const rulesConfig = [
    {
        title: "Publicación y Precio Base",
        icon: FileText,
        points: [
            "Un miembro puede poner su plan en subasta a partir de la 3ra cuota paga.",
            "El vendedor publica su plan. El precio base se establece a partir del total de cuotas emitidas, menos un 50%.",
            "Del monto final a liquidar al vendedor, se deduce cualquier deuda pendiente para entregar el plan saneado, más la comisión por venta (2% + IVA)."
        ]
    },
    {
        title: "Proceso de Oferta y Garantía",
        icon: ShieldCheck,
        points: [
            "Los compradores realizan ofertas durante el plazo de la subasta. Al ganar, tienen 24hs para integrar el capital ofertado más la comisión de compra (2% + IVA).",
            "Si el comprador no paga, el plan se vuelve a subastar y el comprador es bloqueado hasta que pague una multa del 10% + IVA sobre su oferta.",
            "Si un plan no recibe ofertas, la plataforma garantiza su compra al precio base, asegurando una liquidación para el vendedor."
        ]
    },
    {
        title: "Adjudicaciones y Licitaciones",
        icon: Landmark,
        points: [
            "Los actos de adjudicación (sorteo y licitación) se realizan mensualmente a partir del pago de la segunda cuota de cada miembro.",
            "Para participar, los miembros deben tener su cuota al día. La mora suspende este derecho.",
        ]
    },
    {
        title: "Para el Comprador",
        icon: Users,
        points: [
            "Al ganar la subasta, el comprador debe abonar el monto total ofertado más la comisión de compra (2% + IVA) para adquirir el plan.",
            "Una vez adquirido, el comprador asume los derechos y obligaciones del plan, incluyendo los pagos de cuotas futuras."
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
