
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Gift, Award, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        title: "Los últimos serán los primeros",
        description: "Un programa que recompensa la paciencia y el compromiso de nuestros miembros más fieles.",
        icon: Gift,
        clauses: [
            {
                title: "Funcionamiento del Beneficio",
                points: [
                    "Este beneficio está diseñado para los miembros que son adjudicados por sorteo en la recta final de su plan de ahorro.",
                    "Se activa automáticamente si un miembro resulta adjudicado por sorteo dentro del último 20% del plazo total de su grupo.",
                    "Por ejemplo, en un plan de 24 meses, el beneficio aplica si la adjudicación ocurre entre el mes 20 y el 24."
                ]
            },
            {
                title: "La Recompensa",
                points: [
                    "Se realizará la devolución del 50% del 'Derecho de Suscripción' abonado en el plan vigente.",
                    "Se otorgará un Cupón con un descuento del 50% en el 'Derecho de Suscripción' para el próximo plan que el miembro suscriba."
                ]
            },
            {
                title: "Condiciones para Acceder (Bases)",
                points: [
                    "No haber registrado cuotas vencidas ni pagado fuera de término durante toda la vigencia del plan.",
                    "No haber realizado adelanto de cuotas durante la vigencia del plan.",
                    "No haber rechazado un acto de adjudicación previo en el mismo plan.",
                    "El beneficio aplica únicamente a adjudicaciones por sorteo, no por licitación.",
                    "El plan no debe haber sido adquirido a través de una subasta en el mercado secundario.",
                    "El plan no debe haber sido suscripto utilizando un bono de descuento de un beneficio obtenido anteriormente.",
                    "Los beneficios no son acumulables. Solo puede combinarse con el 'Beneficio Sorteo Especial'."
                ]
            }
        ]
    },
    {
        title: "Beneficio Sorteo Especial",
        description: "Una recompensa extra para los adjudicados en el gran sorteo final del grupo.",
        icon: Award,
        clauses: [
            {
                title: "Funcionamiento del Beneficio",
                points: [
                    "Se otorga a todos los miembros que resultan adjudicados en la última cuota del plan a través del 'Sorteo Especial'.",
                    "Los 'Sorteos Especiales' se realizan para distribuir los cupos de adjudicación que pudieron haber quedado vacantes durante el plan (ej: por licitaciones desiertas)."
                ]
            },
            {
                title: "La Recompensa",
                points: [
                    "Además de la adjudicación de su capital, cada ganador del Sorteo Especial recibirá un Premio Sorpresa en forma de Cupón.",
                    "El premio es una bonificación adicional y varía según el grupo y las condiciones promocionales vigentes."
                ]
            },
            {
                title: "Condiciones para Acceder (Bases)",
                points: [
                    "Resultar ganador en una de las adjudicaciones por 'Sorteo Especial' que se realizan en la última cuota del plan.",
                    "No haber registrado cuotas vencidas ni pagado fuera de término durante toda la vigencia del plan.",
                    "No haber realizado adelanto de cuotas durante la vigencia del plan.",
                    "No haber rechazado un acto de adjudicación previo en el mismo plan.",
                    "Este beneficio es el único que puede acumularse con otros beneficios, como 'Los últimos serán los primeros', si se cumplen las condiciones de ambos."
                ]
            }
        ]
    }
];

export default function Benefits() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/panel">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <Gift className="h-8 w-8 text-primary" />
                    Programa de Beneficios
                </h1>
                <p className="text-muted-foreground">Incentivos y recompensas por tu compromiso y fidelidad.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
                {benefits.map((benefit, bIndex) => (
                    <Card key={bIndex} className="shadow-lg h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <benefit.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>{benefit.title}</CardTitle>
                                    <CardDescription>{benefit.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-grow">
                            {benefit.clauses.map((clause, index) => (
                                <div key={index}>
                                    <h3 className="font-semibold text-lg mb-3 border-b pb-2">{clause.title}</h3>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        {clause.points.map((point, pIndex) => (
                                            <li key={pIndex} className="flex items-start gap-3">
                                                <ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Cupones de Beneficios</CardTitle>
                            <CardDescription>Códigos únicos que desbloquean recompensas y descuentos especiales en la plataforma.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">¿Cómo funcionan?</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" />
                                <span>Los cupones son códigos alfanuméricos que recibes en tus notificaciones al cumplir los requisitos de ciertos beneficios (como "Los últimos serán los primeros").</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" />
                                <span>Ofrecen ventajas como descuentos en futuros planes, reintegros en tu billetera o premios especiales.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" />
                                <span>Para usarlos, simplemente copia el código y canjéalo en la sección "Canjear Cupón" de tu Billetera.</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild>
                        <Link href="/panel/wallet">
                            <Ticket className="mr-2 h-4 w-4" />
                            Ir a mi Billetera para canjear
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
