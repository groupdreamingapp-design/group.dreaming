
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Banknote, Briefcase, PiggyBank, Plus } from "lucide-react";
import Link from "next/link";

export default function TransparencyPage() {
    return (
        <>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Transparencia Financiera</h1>
                <p className="text-muted-foreground">
                    Cuando un grupo se activa, tu cuota se divide de forma transparente para asegurar el funcionamiento y la sostenibilidad del sistema.
                </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
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
                         <p className="text-xs text-muted-foreground text-center mt-4 border-t pt-2">El remanente de este fondo se transfiere a la plataforma una vez que el grupo finaliza.</p>
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
                            <li className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-green-500" />
                                <span>Remanente del Fondo de Reserva</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
