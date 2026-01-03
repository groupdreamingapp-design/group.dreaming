
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Megaphone, FileText, ShieldCheck, Clock, Zap, Handshake, UserCheck, HeartHandshake, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

const traditionalPoints = [
    {
        icon: DollarSign,
        title: "Libre Disponibilidad",
        description: "En un plan tradicional, estás atado a un modelo y marca. Con Group Dreaming, recibes el capital y lo usas donde quieras, como un comprador con efectivo.",
    },
    {
        icon: Megaphone,
        title: "Poder de Negociación",
        description: "Con el capital líquido, negocias el precio de contado, bonificaciones y entrega inmediata. Dejas de ser un cliente cautivo y pasas a tener el control.",
    },
    {
        icon: FileText,
        title: "Sin Costos de Prenda",
        description: "Te ahorras el Derecho de Adjudicación, costos de inscripción de prenda y sellados (entre un 3% y 7% del valor del bien) ya que no se prenda el objeto.",
    },
    {
        icon: ShieldCheck,
        title: "Seguro a tu Elección",
        description: "Eliges tu propia compañía de seguros, ahorrando hasta un 40% mensual. No más primas infladas por seguros prendarios obligatorios.",
    }
];

const personalSavingPoints = [
    {
        icon: Clock,
        title: "El Factor Tiempo",
        description: "Si ahorrás solo $500 por mes para algo que sale $12.000, tardás 24 meses exactos. En GD, tenés la probabilidad estadística de tenerlo en el mes 2, 5 o 10. Estás 'comprando tiempo'.",
    },
    {
        icon: Zap,
        title: "Disciplina Financiera",
        description: "El compromiso con un grupo ayuda a mantener la constancia que el ahorro individual suele perder ante la primera tentación de gasto.",
    },
    {
        icon: ShieldCheck,
        title: "Protección MEP",
        description: "Ahorrar billetes físicos tiene riesgos de seguridad. En GD, tu dinero está bancarizado, digitalizado y convertido a valor MEP, protegido contra la devaluación y con trazabilidad total.",
    }
];

const informalCirclePoints = [
    {
        icon: Handshake,
        title: "De la 'Palabra' al Contrato",
        description: "En un círculo informal, un problema financiero pone en riesgo la amistad. En GD, un contrato individual protege la relación; si alguien falla, le falla a un sistema preparado para cubrirlo.",
    },
    {
        icon: UserCheck,
        title: "Alcance y Trazabilidad (KYC)",
        description: "En un grupo de amigos, no sabes quién es el 'amigo de un amigo'. Aquí, cada miembro pasa por una validación de identidad (KYC), asegurando que todos son personas reales y validadas.",
    },
    {
        icon: HeartHandshake,
        title: "Seguridad ante Siniestros",
        description: "Si un participante de un círculo informal fallece, el grupo enfrenta un dilema. En GD, el Seguro de Vida Colectivo cancela la deuda, protegiendo a su familia y al resto de los miembros.",
    },
    {
        icon: BadgeCheck,
        title: "Garantía de Adjudicación",
        description: "En un grupo informal, el último en cobrar cruza los dedos. En GD, la Administradora garantiza la adjudicación de todos los miembros, respaldada por el Fondo de Reserva y la estructura legal.",
    }
];


export default function ComparisonsPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/panel/comparisons');
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
                <h1 className="text-3xl font-bold font-headline">Comparativas</h1>
                <p className="text-muted-foreground">Entiende las ventajas clave de nuestro sistema.</p>
            </div>

            <section className="w-full py-12">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Group Dreaming vs. Plan de Ahorro Tradicional</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        El plan de ahorro te ata a un objeto y a una estructura de costos; Group Dreaming te da el poder del efectivo.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {traditionalPoints.map((point, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <point.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{point.title}</h3>
                            <p className="text-sm text-muted-foreground">{point.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Separator className="my-12" />

            <section className="w-full py-12">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Group Dreaming vs. Ahorro Personal ("Bajo el colchón")</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        No ahorres solo, apaláncate en el grupo.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {personalSavingPoints.map((point, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <point.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{point.title}</h3>
                            <p className="text-sm text-muted-foreground">{point.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Separator className="my-12" />

            <section className="w-full py-12">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Group Dreaming vs. Círculos Informales</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                       "No cambies a tus amigos, cambiá el sistema con el que ahorran."
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {informalCirclePoints.map((point, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <point.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{point.title}</h3>
                            <p className="text-sm text-muted-foreground">{point.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
