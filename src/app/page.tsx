
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

    
