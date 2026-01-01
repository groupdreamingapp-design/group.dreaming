
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Scale, Rows, ShieldCheck, Banknote, PiggyBank, Briefcase, Plus, Minus, ArrowDown } from "lucide-react";
import { Logo } from '@/components/icons';
import { useState, useEffect } from "react";
import { user } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WhyUsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simulate checking user session
    if (user && user.id) {
        setIsLoggedIn(true);
    }
  }, []);

  const pillars = [
    {
      icon: Users,
      title: "Comunidad sobre Capital",
      description: "No eres un número de cliente, eres parte de un grupo con un objetivo común. Nos apalancamos en la confianza y el esfuerzo colectivo, no en la deuda."
    },
    {
      icon: Scale,
      title: "Transparencia Radical",
      description: "Las reglas son claras y para todos por igual. Sin letra chica, sin tasas ocultas, sin sorpresas. Sabes exactamente qué pagas y por qué."
    },
    {
      icon: Rows,
      title: "Flexibilidad Real",
      description: "La vida cambia, tus planes también pueden hacerlo. Nuestro mercado secundario (subastas) te da una vía de salida cuando la necesitas."
    },
    {
      icon: ShieldCheck,
      title: "Seguridad y Tecnología",
      description: "Combinamos la confianza de un círculo de amigos con la robustez de una plataforma tecnológica segura que protege tu dinero y tus datos."
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
          {isLoggedIn ? (
            <Button variant="ghost" asChild>
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
          {isLoggedIn ? (
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
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tus metas, más cerca que nunca.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Group Dreaming es la plataforma de financiamiento colectivo que transforma el ahorro en comunidad en el impulso para hacer realidad tus sueños. Sin deudas, con transparencia y con el poder del grupo.
            </p>
          </div>
        </section>

        <section className="py-24 sm:py-32 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Por qué Group Dreaming es diferente
              </h2>
              <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
                {pillars.map((pillar, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <pillar.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{pillar.title}</h3>
                      <p className="mt-2 text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-24 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Transparencia Financiera: ¿Cómo se administran los fondos?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Cuando un grupo se activa, tu cuota se divide de forma transparente para asegurar el funcionamiento y la sostenibilidad del sistema.
                    </p>
                </div>
                
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                    {/* Flechas y conectores */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-border -translate-y-1/2"></div>
                    <div className="hidden md:block absolute top-1/2 left-1/4 h-12 w-[2px] bg-border -translate-y-full"></div>
                    <div className="hidden md:block absolute top-1/2 left-1/2 h-12 w-[2px] bg-border -translate-y-full"></div>
                    <div className="hidden md:block absolute top-1/2 right-1/4 h-12 w-[2px] bg-border -translate-y-full"></div>

                    <Card className="z-10">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-2">
                                <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle>1. Fondo General del Grupo</CardTitle>
                            <CardDescription>Capital para adjudicaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center">Este es el corazón del grupo. Se utiliza para las adjudicaciones mensuales por sorteo y licitación.</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>Alícuotas Puras</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>Capital de Licitaciones</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>Adelanto de Cuotas (valor puro)</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="z-10">
                        <CardHeader className="text-center">
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-2">
                                <PiggyBank className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <CardTitle>2. Fondo de Reserva</CardTitle>
                            <CardDescription>Garantía y solvencia del grupo</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground text-center">Cubre eventuales incumplimientos y garantiza la compra de planes si no hay ofertas en subasta.</p>
                             <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>50% de Gastos Administrativos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>50% de Derechos de Suscripción</span>
                                </li>
                                 <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>Multas e intereses</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="z-10">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-2">
                                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle>3. Ingresos de la Plataforma</CardTitle>
                            <CardDescription>Sostenibilidad del servicio</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center">Financia la operación, la tecnología y el equipo que hace posible Group Dreaming.</p>
                             <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>50% de Gastos Administrativos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>50% de Derechos de Suscripción</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span>Comisiones del Mercado Secundario</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section className="py-24 sm:py-32 bg-secondary">
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

