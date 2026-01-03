
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Landmark, ShieldCheck, FileText, BadgePercent, Users, Repeat } from "lucide-react";
import Link from "next/link";

const rulesConfig = [
    {
        title: "Publicación y Precio Base",
        icon: FileText,
        points: [
            "Un miembro puede poner su plan en subasta a partir de la 3ra cuota paga.",
            "El vendedor publica su plan. El precio base se establece a partir del total de cuotas emitidas, menos un 50%.",
            "Del monto final a liquidar al vendedor, se deduce cualquier deuda pendiente para entregar el plan saneado, más la comisión por venta (2% + IVA). Si hay un excedente, se acredita al vendedor. Esta lógica aplica tanto para subastas voluntarias como forzosas."
        ]
    },
    {
        title: "Proceso de Oferta y Garantía",
        icon: ShieldCheck,
        points: [
            "Los compradores realizan ofertas durante el plazo de la subasta. Al ganar, tienen 24hs para integrar el capital ofertado más la comisión.",
            "Si el comprador no paga su oferta ganadora, será bloqueado y multado (10% + IVA sobre su oferta). El plan se pondrá nuevamente en subasta por 24hs, notificando a los postores anteriores.",
            "Si un plan no recibe ofertas, la plataforma lo absorbe y utilizará sus propios fondos para realizar la oferta de licitación más alta posible en el mes siguiente, adjudicando ese capital y garantizando la liquidación al vendedor."
        ]
    },
    {
        title: "Para el Comprador",
        icon: Users,
        points: [
            "Al ganar y pagar la subasta, el comprador asume los derechos y obligaciones del plan, incluyendo los pagos de cuotas futuras. La comisión de compra (2% + IVA) se descuenta del capital al momento de la adjudicación.",
        ]
    },
    {
        title: "Planes Adquiridos por Subasta",
        icon: Repeat,
        points: [
            "Un plan que fue adquirido en el mercado secundario no puede volver a ser puesto en subasta.",
            "En caso de incumplimiento grave (ej: 2 o más cuotas vencidas), en lugar de una 'Subasta Forzosa', se procederá a una 'Baja Forzosa' del plan.",
            "En caso de 'Baja Voluntaria' o 'Baja Forzosa', la comisión de compra original se descontará de la liquidación final que se efectúe al cierre del grupo."
        ]
    }
];

export default function AuctionRules() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/panel/auctions">
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

    
