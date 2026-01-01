
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

const contractClauses = [
    {
        title: "PRIMERA: PARTES",
        content: "De una parte, GROUP DREAMING S.A.S., CUIT 30-71888999-1, con domicilio en Av. Rivadavia 5920, Caballito, CABA, en adelante 'LA ADMINISTRADORA'. De otra parte, la persona humana o jurídica cuyos datos se registran en el formulario de alta de la plataforma, en adelante 'EL SUSCRIPTOR'. Ambas partes celebran el presente Contrato de Adhesión a un Sistema de Ahorro Colectivo."
    },
    {
        title: "SEGUNDA: OBJETO",
        content: "El objeto es la adhesión de EL SUSCRIPTOR a un grupo de ahorro administrado por LA ADMINISTRADORA, con el fin de obtener una suma de dinero equivalente al 'Valor Móvil' del capital del grupo suscrito, mediante el pago de cuotas periódicas y la adjudicación por sorteo o licitación."
    },
    {
        title: "TERCERA: FUNCIONAMIENTO DEL SISTEMA",
        content: "EL SUSCRIPTOR se integra a un grupo con un número determinado de miembros, un plazo y un capital definidos. Mensualmente, abonará una cuota compuesta por: a) Alícuota (parte del capital), b) Gastos Administrativos, c) Seguro de Vida sobre saldo deudor. Las adjudicaciones se realizan mensualmente, una por sorteo y otra por licitación, entre los miembros con cuotas al día."
    },
    {
        title: "CUARTA: DERECHOS Y OBLIGACIONES DE LA ADMINISTRADORA",
        content: "LA ADMINISTRADORA se obliga a: gestionar los fondos, realizar los actos de adjudicación con transparencia, entregar los capitales a los adjudicatarios en los plazos estipulados y administrar el Mercado Secundario. Tiene derecho a percibir los Gastos Administrativos y comisiones por los servicios prestados."
    },
    {
        title: "QUINTA: DERECHOS Y OBLIGACIONES DEL SUSCRIPTOR",
        content: "EL SUSCRIPTOR se obliga a pagar puntualmente las cuotas. Tiene derecho a participar de los actos de adjudicación, licitar, ceder su plan en el Mercado Secundario (subasta) o solicitar la baja. En caso de ser adjudicado, se compromete a seguir pagando las cuotas restantes hasta la finalización del plazo del grupo."
    },
    {
        title: "SEXTA: FINALIZACIÓN DEL CONTRATO, INCUMPLIMIENTO Y BAJA",
        content: "El contrato finalizará de pleno derecho al vencimiento del plazo del grupo, una vez que todas las cuotas hayan sido abonadas y el capital adjudicado haya sido entregado. Por otro lado, la falta de pago de dos (2) o más cuotas consecutivas o alternadas facultará a LA ADMINISTRADORA a declarar la rescisión del contrato. Si el plan fue adquirido en el mercado secundario, se procederá a una 'Baja Forzosa'. Si es un plan original, se procederá a una 'Subasta Forzosa'. La baja voluntaria implica la devolución del capital puro aportado al final del ciclo del grupo, descontando las penalidades correspondientes."
    },
    {
        title: "SÉPTIMA: MONEDA Y TIPO DE CAMBIO",
        content: "Todos los valores, capitales, cuotas y transacciones expresados en la plataforma se denominan en Dólares Estadounidenses (USD). Cualquier pago, liquidación o transferencia que deba realizarse en Pesos Argentinos (ARS) se convertirá utilizando la cotización de 'Dólar MEP' (dólar bolsa) vendedora informada por una fuente de mercado de referencia al cierre del día hábil inmediato anterior a la fecha de la operación."
    },
    {
        title: "OCTAVA: LIMITACIÓN DE RESPONSABILIDAD",
        content: "LA ADMINISTRADORA no será responsable por daños, perjuicios o pérdidas sufridas por EL SUSCRIPTOR causados por fallas en el sistema, en el servidor o en Internet, que sean ajenas a su control. Tampoco será responsable por cualquier virus que pudiera infectar el equipo de EL SUSCRIPTOR como consecuencia del acceso o uso de su sitio web. EL SUSCRIPTOR es el único responsable de la confidencialidad de su contraseña y del uso de su cuenta, y exime de responsabilidad a LA ADMINISTRADORA por el acceso no autorizado o uso indebido de la misma por parte de terceros."
    },
    {
        title: "NOVENA: JURISDICCIÓN",
        content: "Para cualquier controversia que pudiera surgir de la interpretación o ejecución del presente contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero o jurisdicción."
    }
];

export default function ContractPage() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Contrato de Adhesión</h1>
                <p className="text-muted-foreground">Términos y condiciones del sistema de ahorro colectivo de Group Dreaming.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText />
                        Contrato de Adhesión a Sistema de Ahorro Colectivo
                    </CardTitle>
                    <CardDescription>
                        Fecha de última actualización: 1 de Julio de 2024
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {contractClauses.map((clause, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-lg mb-2">{clause.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {clause.content}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    );
}
