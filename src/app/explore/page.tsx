
'use client';

import { useMemo } from "react";
import { initialGroups } from "@/lib/data";
import { GroupCard } from "@/components/app/group-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/types";

export default function ExplorePage() {
  const availableGroups: Group[] = useMemo(() => {
    // For the public page, we just show all "Open" groups from the initial static data.
    // The "userIsMember" and "onJoin" logic is handled within the authenticated dashboard.
    return initialGroups.filter(g => g.status === 'Abierto');
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Group Dreaming</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Comenzar Ahora</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 bg-secondary/40">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Explorar Grupos Disponibles</h1>
            <p className="text-muted-foreground">Encuentra el plan perfecto que se adapte a tus sueños.</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="capital" className="text-sm font-medium text-muted-foreground">Capital (USD)</label>
                  <Input id="capital" placeholder="Ej: 10000 - 20000" />
                </div>
                <div>
                  <label htmlFor="plazo" className="text-sm font-medium text-muted-foreground">Plazo (meses)</label>
                  <Input id="plazo" placeholder="Ej: 24 - 60" />
                </div>
                <div>
                  <label htmlFor="cuota" className="text-sm font-medium text-muted-foreground">Cuota Promedio</label>
                  <Input id="cuota" placeholder="Máx: 500" />
                </div>
                <div>
                    <label htmlFor="ordenar" className="text-sm font-medium text-muted-foreground">Ordenar por</label>
                    <Select>
                        <SelectTrigger id="ordenar">
                            <SelectValue placeholder="Más cerca de completarse" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="progress">Más cerca de completarse</SelectItem>
                            <SelectItem value="capital-asc">Menor capital</SelectItem>
                            <SelectItem value="capital-desc">Mayor capital</SelectItem>
                            <SelectItem value="plazo-asc">Menor plazo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
            </CardContent>
          </Card>
           <Separator />
           {availableGroups.length > 0 ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableGroups.map(group => (
                // For the public page, the onJoin will redirect to registration.
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  showJoinButton={true} 
                  isPublic={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>No hay grupos disponibles en este momento.</p>
                <p>¡Vuelve a intentarlo más tarde!</p>
            </div>
          )}
        </div>
      </main>
       <footer className="bg-secondary/80 mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Group Dreaming (Group Dreaming S.A.S.). Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

    