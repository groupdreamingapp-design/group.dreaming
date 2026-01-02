'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, CheckCircle, Clock, Home, LayoutDashboard, PieChart, PiggyBank, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';

const features = [
  {
    icon: PiggyBank,
    title: 'Ahorro Inteligente',
    description: 'Nuestros grupos te ayudan a ahorrar de forma constante y disciplinada para alcanzar grandes metas.'
  },
  {
    icon: Users,
    title: 'Comunidad Fuerte',
    description: 'Únete a personas con tus mismos sueños. La fuerza del grupo te impulsa a no rendirte.'
  },
  {
    icon: Clock,
    title: 'Adjudicación Acelerada',
    description: 'No esperes al final. Con nuestro sistema de sorteo y licitación, puedes obtener tu capital antes de lo previsto.'
  },
  {
    icon: Home,
    title: 'Flexibilidad Total',
    description: '¿Tus planes cambiaron? Vende tu participación en nuestro mercado secundario y recupera tu inversión.'
  },
];

const goals = [
  PlaceHolderImages.find(img => img.id === 'goal-car'),
  PlaceHolderImages.find(img => img.id === 'goal-travel'),
  PlaceHolderImages.find(img => img.id === 'goal-house'),
].filter(Boolean) as any[];


export default function LandingPageClient() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-family');
  const { user, loading } = useUser();

  const renderAuthButtons = () => {
    // Wait until the auth state is fully resolved
    if (loading) {
      return (
        <div className="h-10 w-[210px]"></div> // Placeholder to prevent layout shift
      );
    }

    if (user) {
      return (
        <Button asChild>
          <Link href="/panel">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Ir a Mi Panel
          </Link>
        </Button>
      );
    }

    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/login">Ingresar</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Comenzar Ahora</Link>
        </Button>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <Link href="#" className="flex items-center justify-center">
          <Logo className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold">Group Dreaming</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="flex gap-2">
            {renderAuthButtons()}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full pt-24 pb-12 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
           <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  El impulso para lo que de verdad importa.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Group Dreaming transforma el ahorro en una experiencia colectiva y poderosa. Únete a un grupo, aporta tu parte y mira cómo tus sueños se hacen realidad antes de lo que imaginas.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" variant="secondary" asChild>
                   <Link href="/panel/transparency">
                      <PieChart className="mr-2 h-4 w-4" />
                      Ver Transparencia
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                   <Link href="/panel/explore">Explorar Grupos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">¿Cómo funciona?</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Una forma más inteligente de alcanzar tus metas</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Olvídate del ahorro en solitario. Aprovecha el poder de la comunidad para acelerar tus proyectos.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-2">
                   <div className="bg-background p-3 rounded-full w-fit shadow-md border">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Desde un auto nuevo hasta el viaje de tus sueños</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nuestros grupos flexibles se adaptan a cualquier meta que tengas. El capital que necesitas, en el plazo que te conviene.
              </p>
               <ul className="grid gap-2 py-4">
                <li>
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-primary" />
                  Planes desde 12 hasta 84 meses.
                </li>
                <li>
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-primary" />
                  Capitales que se ajustan a tus necesidades.
                </li>
                <li>
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-primary" />
                  Adjudicación mensual por sorteo y licitación.
                </li>
              </ul>
               <Button asChild size="lg">
                  <Link href="/panel/explore">
                    Ver Grupos Disponibles
                  </Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {goals.map((goal, index) => (
                    <div key={goal.id} className={`rounded-xl overflow-hidden shadow-lg ${index === 2 ? 'col-span-2' : ''}`}>
                      <Image
                        src={goal.imageUrl}
                        alt={goal.description}
                        width={goal.width}
                        height={goal.height}
                        className="aspect-video object-cover"
                        data-ai-hint={goal.imageHint}
                      />
                    </div>
                ))}
            </div>
          </div>
        </section>


        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Transparencia</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tu confianza es nuestra prioridad</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Operamos con total claridad. Conoce a fondo nuestro sistema, los contratos y cómo se gestionan los fondos de cada grupo. Tu tranquilidad es fundamental para nosotros.
                </p>
                <Button asChild>
                  <Link href="/panel/transparency">Conoce más sobre nuestra transparencia</Link>
                </Button>
              </div>
              <div className="flex flex-col items-start space-y-4">
                 <Card className="w-full">
                    <CardHeader className="pb-4">
                      <CardTitle>Contrato de Adhesión</CardTitle>
                      <CardDescription>Lee nuestros términos y condiciones de forma clara y sencilla.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" asChild>
                        <Link href="/panel/contract">Ver Contrato</Link>
                      </Button>
                    </CardContent>
                  </Card>
                   <Card className="w-full">
                    <CardHeader className="pb-4">
                      <CardTitle>Preguntas Frecuentes</CardTitle>
                      <CardDescription>Encuentra respuestas a las dudas más comunes sobre la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" asChild>
                        <Link href="/panel/faq">Ir a las FAQ</Link>
                      </Button>
                    </CardContent>
                  </Card>
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Group Dreaming. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/panel/contract" className="text-xs hover:underline underline-offset-4">Términos de Servicio</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacidad</Link>
        </nav>
      </footer>
    </div>
  )
}
