
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

const faqData = [
    {
        question: "¿Cómo funciona el sistema de ahorro colectivo?",
        answer: "Te unes a un grupo con otras personas que quieren alcanzar una meta similar. Cada mes, todos los miembros pagan una cuota. Ese dinero forma un fondo común que se usa para adjudicar (entregar) el capital a dos miembros cada mes: uno por sorteo y otro por licitación."
    },
    {
        question: "¿Cuál es la diferencia entre Sorteo y Licitación?",
        answer: "El Sorteo es pura suerte; tu número de orden asignado puede salir elegido en cualquier momento. La Licitación es una oferta; el miembro que ofrezca adelantar la mayor cantidad de cuotas gana la adjudicación de ese mes. Es una forma de acelerar la obtención de tu capital."
    },
    {
        question: "¿Qué pasa si un miembro deja de pagar su cuota?",
        answer: "El sistema está diseñado para ser resiliente. Usamos el 'Fondo de Reserva' (formado por una parte de los gastos administrativos y multas) para cubrir los pagos de los miembros morosos y asegurar que el grupo siga funcionando y realizando las adjudicaciones sin problemas."
    },
    {
        question: "¿Puedo salir de un grupo si ya no quiero o no puedo continuar?",
        answer: "Sí, tienes dos opciones flexibles. Puedes solicitar la 'Baja Voluntaria', donde recibirás el capital puro que aportaste al final del ciclo del grupo (con una penalidad). O, a partir de la 3ra cuota, puedes 'Subastar' tu plan en nuestro Mercado Secundario para que otro inversor lo compre y recuperes tu dinero más rápido."
    },
    {
        question: "¿Qué es la 'Alícuota Pura'?",
        answer: "La alícuota pura es el resultado de dividir el valor total del capital del grupo por el número de meses del plan. Es, en esencia, la parte de tu cuota que va directamente a tu ahorro para el capital final. El resto de la cuota se compone de gastos administrativos y seguro de vida."
    },
    {
        question: "¿Por qué debo verificar mi identidad (KYC)?",
        answer: "La verificación de identidad (Conoce a tu Cliente) es un requisito legal obligatorio para todas las entidades financieras. Nos ayuda a prevenir fraudes y lavado de dinero, garantizando que la plataforma sea un entorno seguro y transparente para todos los miembros."
    },
    {
        question: "¿Qué es el Mercado Secundario (Subastas)?",
        answer: "Es un espacio donde puedes vender tu plan de ahorro a otro miembro de la comunidad. Si necesitas el dinero antes de ser adjudicado, puedes poner tu plan en subasta. Otros usuarios pueden ofertar por él, permitiéndote una salida anticipada."
    }
];

export default function FaqPage() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                    Preguntas Frecuentes
                </h1>
                <p className="text-muted-foreground">Encuentra respuestas a las dudas más comunes sobre Group Dreaming.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {faqData.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline text-lg">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    );
}
