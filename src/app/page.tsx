
'use client';

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Users, HandCoins, PiggyBank } from "lucide-react";
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/icons';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-family');
const goalImages = [
    PlaceHolderImages.find((img) => img.id === 'goal-house'),
    PlaceHolderImages.find((img) => img.id === 'goal-car'),
    PlaceHolderImages.find((img) => img.id === 'goal-travel'),
]

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  const definitions = [
    { title: "ADMINISTRADORA", content: "Refiere a Group Dreaming S.A.S., sociedad que gestiona y administra la PLATAFORMA." },
    { title: "USUARIO", content: "La persona humana o jurídica que se registra en la PLATAFORMA." },
    { title: "PLATAFORMA", content: "El sitio web y la aplicación móvil de Group Dreaming." },
    { title: "Capital Suscripto", content: "Es el monto total en Dólares Estadounidenses (USD) del financiamiento al que el USUARIO adhiere." },
    { title: "Plazo", content: "Es la cantidad total de cuotas mensuales, iguales y consecutivas en las que se divide el plan." },
    { title: "Alícuota Pura", content: "Es el valor que resulta de dividir el Capital Suscripto por el Plazo. Representa la porción de capital puro dentro de cada cuota." },
    { title: "Miembros", content: "Son todos los participantes que conforman un grupo de financiamiento." },
    { title: "Seguro de Vida", content: "Es un seguro mensual obligatorio sobre saldos deudores que cubre el capital pendiente de pago en caso de fallecimiento del titular." },
    { title: "Adjudicación", content: "Es el acto por el cual un miembro del grupo obtiene el derecho a recibir el capital suscripto. Puede ocurrir por sorteo o licitación." },
    { title: "Licitación (o Pujo)", content: "Una oferta que realiza un miembro, consistente en el adelanto de un número de cuotas puras, para aumentar sus posibilidades de ser adjudicado." },
    { title: "Sorteo", content: "El método de adjudicación mensual donde un miembro es seleccionado al azar entre los miembros con cuota al día para recibir el capital." },
    { title: "Derecho de Suscripción", content: "Un costo único que se paga al ingresar a un grupo, que cubre los gastos iniciales de administración y estructuración." },
    { title: "Subasta (Mercado Secundario)", content: "El mecanismo que permite a un miembro ceder onerosamente su plan a otro inversor, ofreciendo una vía de salida flexible." },
    { title: "Baja del Plan", content: "La solicitud de un miembro para rescindir su participación en el grupo antes de su finalización, sujeta a las condiciones del contrato." },
    { title: "Mora", content: "El estado en el que se encuentra un miembro al no cumplir con el pago de una o más cuotas en la fecha de vencimiento establecida." },
  ];

  const rules = [
    {
      title: "Costos de Ingreso y Mantenimiento",
      content: "Derecho de Suscripción: 3% + IVA sobre el capital, financiado en el primer 20% de las cuotas. Gastos Administrativos Mensuales: 10% + IVA sobre la alícuota pura. Seguro de Vida Mensual: 0.09% sobre el saldo de capital pendiente."
    },
    {
      title: "Adjudicación y Presentación de Garantías",
      content: "Tras resultar adjudicado (por sorteo o licitación), el miembro tiene 48hs para aceptar, 72hs hábiles para presentar garantías y 24hs para integrar capital si licitó. El incumplimiento puede resultar en la pérdida del derecho de adjudicación. El sorteo se transmite en vivo. Si al momento de la adjudicación existe un saldo pendiente del \"Derecho de Suscripción\", este será descontado del capital a recibir."
    },
    {
      title: "Incumplimiento de Licitación Ganadora",
      content: "Si un miembro gana una licitación pero no integra el monto ofertado, se aplicará una multa del 2% + IVA sobre el valor de la oferta y quedará inhabilitado para licitar por 5 meses. La multa se descontará de su futura adjudicación o liquidación final."
    },
    {
      title: "Gestión de Mora y Consecuencias",
      content: "A los 15 días de mora, se suspenden los derechos del miembro a participar en sorteos y licitaciones. Con 3 cuotas impagas, su plan será subastado forzosamente para cubrir la deuda."
    },
    {
      title: "Subasta de Planes (Mercado Secundario)",
      content: "El vendedor puede publicar su plan estableciendo un precio base para cubrir deudas. La comisión del 2% + IVA se descuenta de la venta. Si no hay ofertas, la plataforma garantiza la compra al precio base. El comprador asume una comisión del 2% + IVA sobre su futura adjudicación. Si un plan es adjudicado y puesto en subasta, el plazo de la misma será el tiempo restante para confirmar la adjudicación."
    },
    {
      title: "Política de Baja de Plan",
      content: "Solo para planes no adjudicados. El capital aportado (alícuotas puras) se devuelve al final del plazo del grupo, con un descuento del 5% + IVA por rescisión. Los planes ya adjudicados no pueden darse de baja."
    },
    {
      title: "Política de Privacidad y Uso de Datos",
      content: "Group Dreaming se compromete a proteger tu privacidad. Tus datos se usan exclusivamente para gestionar la plataforma y no se comparten con terceros para fines comerciales. Consulta nuestra política de privacidad completa para más detalles."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Group Dreaming</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/explore">Explorar Grupos</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Comenzar Ahora</Link>
          </Button>
        </nav>
         <nav className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/explore">Explorar</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Ingresar</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center justify-center">
          {heroImage &&
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent"></div>
          <div className="container relative mx-auto px-4 text-center text-foreground">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Group Dreaming: El impulso para lo que de verdad importa.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 sm:text-xl">
              Somos una comunidad que transforma el ahorro en acción. Unimos la confianza de los círculos de amigos con la seguridad de la tecnología para que alcances tus metas.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/register">
                  Únete a un Grupo <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Goals Section */}
        <section className="py-24 sm:py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                    Materializa tus sueños
                </h2>
                <p className="mt-4 text-center text-lg text-muted-foreground">
                    Tu casa, tu auto, ese viaje que tanto esperas. Todo es posible.
                </p>
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {goalImages.map((image, index) => image && (
                        <div key={index} className="group relative overflow-hidden rounded-lg">
                            <Image 
                                src={image.imageUrl}
                                alt={image.description}
                                width={image.width}
                                height={image.height}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={image.imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6">
                                <h3 className="text-2xl font-bold text-white">{image.description}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Deja de postergar y empieza a vivir
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Accede a tu capital sin burocracia ni intereses infinitos.
            </p>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Comunidad Fuerte</h3>
                <p className="mt-2 text-muted-foreground">El apoyo mutuo es la base de nuestro sistema.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PiggyBank className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Ahorro Inteligente</h3>
                <p className="mt-2 text-muted-foreground">Convierte tu esfuerzo en capital de libre disponibilidad.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HandCoins className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Sin Intereses Bancarios</h3>
                <p className="mt-2 text-muted-foreground">Un modelo de financiación colectivo y transparente.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Seguridad Tecnológica</h3>
                <p className="mt-2 text-muted-foreground">Tu dinero y tus datos, protegidos en todo momento.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Definitions & Rules Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Transparencia y Reglas Claras
              </h2>
              <p className="mt-4 text-center text-lg text-muted-foreground">
                Conoce cómo funciona nuestra plataforma en cada detalle.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-4">Definiciones Clave</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {definitions.map((def, i) => (
                      <AccordionItem value={`item-${i}`} key={i}>
                        <AccordionTrigger>{def.title}</AccordionTrigger>
                        <AccordionContent>{def.content}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Reglas del Sistema</h3>
                  <div className="space-y-4">
                    {rules.map((rule, i) => (
                      <Card key={i}>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{rule.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">{rule.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} Group Dreaming (Group Dreaming S.A.S.). Todos los derechos reservados.</p>
          <p className="text-sm mt-2">Hecho con ❤️ para cumplir sueños.</p>
        </div>
      </footer>
    </div>
  );

}
