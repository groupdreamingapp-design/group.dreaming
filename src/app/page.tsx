
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Scale, Rows, ShieldCheck, Star } from "lucide-react";
import { Logo } from '@/components/icons';
import { user as mockUser } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function WhyUsPage() {
  const user = mockUser;

  const pillars = [
    {
      icon: Users,
      title: "Comunidad",
      description: "Nos apalancamos en la confianza y el esfuerzo colectivo, no en la deuda."
    },
    {
      icon: Scale,
      title: "Transparencia",
      description: "Sin letra chica ni tasas ocultas. Sabes exactamente qué pagas y por qué."
    },
    {
      icon: Rows,
      title: "Flexibilidad",
      description: "Nuestro mercado secundario te da una vía de salida cuando la necesitas."
    },
    {
      icon: ShieldCheck,
      title: "Seguridad",
      description: "Plataforma robusta que combina confianza con tecnología para proteger tu dinero."
    }
  ];

  const goals = PlaceHolderImages.filter(img => ["goal-car", "goal-travel", "goal-house"].includes(img.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Group Dreaming</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild><Link href="/">Por qué nosotros</Link></Button>
          <Button variant="ghost" asChild><Link href="/dashboard/explore">Explorar Grupos</Link></Button>
          <Button variant="ghost" asChild><Link href="/dashboard/transparency">Transparencia</Link></Button>
          <div className="w-px h-6 bg-border mx-2"></div>
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Ir a mi Panel</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Comenzar Ahora</Link>
              </Button>
            </>
          )}
        </nav>
         <nav className="md:hidden flex items-center gap-2">
          {user ? (
             <Button asChild size="sm">
                <Link href="/dashboard">Mi Panel</Link>
              </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Ingresar</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tus metas, más cerca que nunca.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Somos la plataforma de financiamiento colectivo que transforma el ahorro en comunidad en el impulso para hacer realidad tus sueños. Sin deudas, con transparencia y con el poder del grupo.
            </p>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
             <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {goals.map((goal, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="relative flex aspect-[4/3] items-center justify-center p-0">
                          <Image
                            src={goal.imageUrl}
                            alt={goal.description}
                            width={goal.width}
                            height={goal.height}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                           <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                            {goal.description}
                          </h3>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
        
        <section className="py-24 sm:py-32 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">NUESTROS PILARES</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Por qué Group Dreaming es diferente</p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <pillar.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-7 text-foreground">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Listo para empezar a soñar en grupo?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Explora los planes disponibles y únete a una comunidad que está cambiando las reglas del juego.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link href="/dashboard/explore">
                  Explorar Grupos Disponibles <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Group Dreaming (Group Dreaming S.A.S.). Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
