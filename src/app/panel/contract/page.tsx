

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

const contractClauses = [
    {
        title: "PRIMERA: PARTES",
        content: "De una parte, GROUP DREAMING S.A.S., CUIT 30-71888999-1, con domicilio en Av. Rivadavia 5920, Caballito, CABA, en adelante 'LA ADMINISTRADORA'. De otra parte, la persona humana o jurídica cuyos datos se registran en el formulario de alta de la plataforma, en adelante 'EL SUSCRIPTOR'. EL SUSCRIPTOR declara bajo juramento que toda la información y datos personales proporcionados en el formulario de registro y/o verificación son veraces, exactos y completos, asumiendo total responsabilidad por su falsedad u omisión, y deslindando a LA ADMINISTRADORA de cualquier responsabilidad que pudiera surgir a raíz de ello. Ambas partes celebran el presente Contrato de Adhesión a un Sistema de Ahorro Colectivo."
    },
    {
        title: "SEGUNDA: OBJETO",
        content: "El objeto es la adhesión de EL SUSCRIPTOR a un grupo de ahorro administrado por LA ADMINISTRADora, con el fin de obtener una suma de dinero equivalente al 'Valor Móvil' del capital del grupo suscrito, mediante el pago de cuotas periódicas y la adjudicación por sorteo o licitación."
    },
    {
        title: "TERCERA: FUNCIONAMIENTO DEL SISTEMA",
        content: "EL SUSCRIPTOR se integra a un grupo con un número determinado de miembros, un plazo y un capital definidos. Para confirmar su adhesión, EL SUSCRIPTOR abonará la primera cuota al momento de unirse. El grupo se considerará 'Activo' una vez que el último miembro se haya unido y abonado su primera cuota. A partir de la fecha de activación del grupo, se generará la segunda cuota con un vencimiento a los 30 (treinta) días, y las cuotas subsiguientes vencerán en la misma fecha de cada mes. Mensualmente, abonará una cuota compuesta por: a) Alícuota (parte del capital), b) Gastos Administrativos, c) Seguro de Vida sobre saldo deudor. EL SUSCRIPTOR declara bajo juramento gozar de buena salud, y que tiene pleno conocimiento de que el seguro de vida contratado en forma colectiva por LA ADMINISTRADORA no cubre siniestros ocurridos a consecuencia de enfermedades preexistentes a la fecha de suscripción del presente contrato."
    },
    {
        title: "CUARTA: ACTO DE ADJUDICACIÓN",
        content: "Mensualmente se realizan dos adjudicaciones: una por sorteo y otra por licitación. En la licitación, la oferta mínima es de una (1) cuota pura y la máxima es la totalidad de las cuotas puras futuras pendientes de pago. En caso de empate entre dos o más ofertas de licitación, se declarará ganador al suscriptor que posea el número de orden más bajo dentro del grupo. REGLA DE PRIORIDAD: Si LA ADMINISTRADORA ha adquirido un plan (por baja de un miembro o por absorber una subasta sin ofertas), dicho plan licitará automáticamente por el monto máximo posible en el mes vigente. Esta oferta de LA ADMINISTRADORA tendrá prioridad y ganará la adjudicación por licitación de ese mes, anulando cualquier otra oferta de licitación para ese cupo, con el fin de garantizar la liquidez y el correcto funcionamiento del grupo. En caso de que LA ADMINISTRADORA posea más de un plan en un mismo grupo, estos se utilizarán para ganar la licitación en meses sucesivos, por orden progresivo de adquisición, asegurando una inyección de capital constante."
    },
    {
        title: "QUINTA: DERECHOS Y OBLIGACIONES DE LA ADMINISTRADORA",
        content: "LA ADMINISTRADORA se obliga a: a) Gestionar los fondos de los grupos de manera diligente y transparente. b) Realizar mensualmente los actos de adjudicación. c) Entregar los capitales a los suscriptores adjudicados en los plazos estipulados, previa constitución de las garantías correspondientes. d) Administrar el Mercado Secundario (Subastas), garantizando un proceso justo. Esto incluye: publicar los planes, establecer el precio base (50% del total de cuotas puras emitidas), y liquidar el monto al vendedor descontando deudas y la comisión del 2% (+IVA). e) Si un plan en subasta no recibe ofertas, LA ADMINISTRADORA lo absorberá, utilizando sus propios fondos para realizar una oferta de licitación en el mes siguiente y así garantizar la liquidación al vendedor."
    },
    {
        title: "SEXTA: DERECHOS Y OBLIGACIONES DEL SUSCRIPTOR",
        content: "EL SUSCRIPTOR se obliga a: a) Pagar puntualmente las cuotas mensuales. b) En caso de ser adjudicado, constituir las garantías requeridas por LA ADMINISTRADORA y continuar pagando las cuotas restantes. EL SUSCRIPTOR tiene derecho a: c) Participar de los actos de adjudicación si su cuota está al día. d) Ceder su plan en el Mercado Secundario (subastar) a partir de la 3ra cuota paga. e) Solicitar la baja voluntaria del plan. f) Como comprador en una subasta, al ganar y pagar, asume todos los derechos y obligaciones del plan, incluyendo los pagos futuros. La comisión de compra (2% +IVA) se descuenta del capital al momento de su adjudicación. Un plan adquirido en subasta no puede volver a ser subastado."
    },
    {
        title: "SÉPTIMA: GARANTÍAS DE ADJUDICACIÓN",
        content: "Al momento de resultar adjudicado y previo a la entrega del capital, EL SUSCRIPTOR deberá constituir una garantía a satisfacción de LA ADMINISTRADORA para asegurar el pago de las cuotas restantes. La garantía será determinada por LA ADMINISTRADORA en función del análisis de riesgo crediticio del suscriptor. Las opciones de garantía, presentadas de forma inclusiva y flexible, son: a) la contratación de un Seguro de Caución por Saldo Deudor a cargo del suscriptor, cuyo costo podrá ser descontado del capital a recibir, b) la presentación de una garantía propietaria de un inmueble, o c) la demostración de ingresos fehacientes (como recibos de sueldo) que, a exclusivo criterio de LA ADMINISTRADORA, demuestren solvencia suficiente para cubrir el saldo pendiente."
    },
    {
        title: "OCTAVA: FINALIZACIÓN DEL CONTRATO, INCUMPLIMIENTO Y BAJA",
        content: "El contrato finalizará de pleno derecho al vencimiento del plazo del grupo. La falta de pago de dos (2) o más cuotas facultará a LA ADMINISTRADORA a declarar la rescisión. Si es un plan original, se procederá a una 'Subasta Forzosa'; del monto obtenido en la misma, se cubrirán deudas, penalidades y comisiones, y el excedente, si lo hubiere, será acreditado al suscriptor original. Si el plan fue adquirido en subasta, se procederá a una 'Baja Forzosa'. La 'Baja Voluntaria' implica la devolución del capital puro aportado al final del ciclo del grupo, con las penalidades correspondientes. Si el grupo no se ha activado transcurridos 60 (sesenta) días desde la adhesión de EL SUSCRIPTOR, éste tendrá derecho a solicitar la 'Cancelación por Demora', recibiendo el reintegro total e inmediato de la primera cuota abonada. Si el ganador de una subasta no integra el capital en 24hs, será multado (10% +IVA sobre su oferta) y el plan se volverá a subastar."
    },
    {
        title: "NOVENA: MONEDA Y TIPO DE CAMBIO",
        content: "Todos los valores, capitales, cuotas y transacciones expresados en la plataforma se denominan en Dólares Estadounidenses (USD). Cualquier pago, liquidación o transferencia que deba realizarse en Pesos Argentinos (ARS) se convertirá utilizando la cotización de 'Dólar MEP' (dólar bolsa) vendedora informada por una fuente de mercado de referencia al cierre del día hábil inmediato anterior a la fecha de la operación."
    },
    {
        title: "DÉCIMA: GESTIÓN DE FONDOS TRANSITORIOS",
        content: "Los fondos recaudados que se encuentren a la espera de ser adjudicados podrán ser colocados transitoriamente en activos de alta liquidez y bajo riesgo (Fondos Money Market) con el único fin de solventar gastos comunes del grupo, tales como primas de seguros de vida o gastos bancarios, optimizando la cuota final del suscriptor. Los rendimientos generados se aplicarán íntegramente a este concepto de compensación de gastos."
    },
    {
        title: "UNDÉCIMA: LIMITACIÓN DE RESPONSABILIDAD Y CONTINGENCIA",
        content: "LA ADMINISTRADORA no será responsable por daños, perjuicios o pérdidas sufridas por EL SUSCRIPTOR causados por fallas en el sistema, en el servidor o en Internet, que sean ajenas a su control. Tampoco será responsable por cualquier virus que pudiera infectar el equipo de EL SUSCRIPTOR. En caso de una falla general del sistema confirmada por LA ADMINISTRADORA que afecte plazos críticos (ej. pago de subastas, aceptación de adjudicaciones), dichos plazos serán extendidos automáticamente por 24 horas a partir del restablecimiento del servicio, sin penalidad para el usuario."
    },
    {
        title: "DUODÉCIMA: CONFIDENCIALIDAD Y USO DE LA CUENTA",
        content: "EL SUSCRIPTOR es el único responsable de la confidencialidad de su contraseña y del uso de su cuenta, y exime de responsabilidad a LA ADMINISTRADORA por el acceso no autorizado o uso indebido de la misma por parte de terceros."
    },
    {
        title: "DECIMOTERCERA: JURISDICCIÓN",
        content: "Para cualquier controversia que pudiera surgir de la interpretación o ejecución del presente contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero o jurisdicción."
    },
    {
        title: "DECIMOCUARTA: ACEPTACIÓN",
        content: "EL SUSCRIPTOR, al hacer clic en el botón 'Confirmar y Unirme' o acción equivalente en la plataforma y habiendo tildado la casilla de aceptación, manifiesta su consentimiento y aceptación expresa, incondicional e irrevocable de todos y cada uno de los términos y condiciones establecidos en el presente Contrato de Adhesión, perfeccionándose el vínculo contractual entre las partes."
    },
    {
        title: "DECIMOQUINTA: ANEXO DE BENEFICIOS",
        content: "LA ADMINISTRADORA podrá ofrecer programas de beneficios y recompensas a los suscriptores. Los términos, condiciones, vigencia y funcionamiento de dichos programas se detallarán en la sección 'Beneficios' de la plataforma, la cual se considera un anexo al presente contrato. LA ADMINISTRADORA se reserva el derecho de modificar o discontinuar dichos programas, comunicándolo de forma fehaciente. La participación en los mismos es opcional y está sujeta al cumplimiento de las bases y condiciones específicas de cada uno."
    }
];

export default function Contract() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/panel">
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
