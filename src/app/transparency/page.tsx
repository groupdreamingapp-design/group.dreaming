
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Banknote, Briefcase, PiggyBank, Plus, ArrowDown, Users, Calendar, Target, Award, CheckCircle, Hand } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useEffect } from "react";

export default function Transparency() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/panel/transparency');
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
                <h1 className="text-3xl font-bold font-headline">Transparencia Financiera y Operativa</h1>
                <p className="text-muted-foreground">
                    Tu cuota se divide de forma transparente para asegurar el funcionamiento, la sostenibilidad y la equidad del sistema.
                </p>
            </div>

            <Card className="mb-12">
                <CardHeader>
                    <CardTitle>Transparencia Financiera: ¿A dónde va tu dinero?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                        <div className="z-10 flex flex-col items-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-2">
                                <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-center text-lg font-semibold">1. Fondo General del Grupo</h3>
                            <p className="text-center text-sm text-muted-foreground">Capital para adjudicaciones</p>
                             <ul className="mt-4 space-y-2 text-sm text-left w-full">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Alícuotas Puras</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Capital de Licitaciones</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Adelanto de Cuotas (valor puro)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="z-10 flex flex-col items-center">
                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-2">
                                <PiggyBank className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h3 className="text-center text-lg font-semibold">2. Fondo de Reserva</h3>
                            <p className="text-center text-sm text-muted-foreground">Garantía y solvencia del grupo</p>
                            <ul className="mt-4 space-y-2 text-sm text-left w-full">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>50% de Gastos Administrativos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>50% de Derechos de Suscripción</span>
                                </li>
                                 <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Multas e intereses</span>
                                </li>
                            </ul>
                             <p className="text-xs text-muted-foreground text-center mt-4 border-t pt-2">Cubre incumplimientos y garantiza la compra en subastas. El remanente se transfiere a la plataforma al finalizar el grupo.</p>
                        </div>

                        <div className="z-10 flex flex-col items-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-2">
                                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-center text-lg font-semibold">3. Ingresos de la Plataforma</h3>
                            <p className="text-center text-sm text-muted-foreground">Sostenibilidad del servicio</p>
                             <ul className="mt-4 space-y-2 text-sm text-left w-full">
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>50% de Gastos Administrativos</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>50% de Derechos de Suscripción</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Comisiones del Mercado Secundario</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>Remanente del Fondo de Reserva</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Transparencia Operativa: El Viaje de tu Grupo</CardTitle>
                    <CardDescription>Un ejemplo del ciclo de vida de un grupo de ahorro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex flex-col items-center space-y-8">
                        
                        <div className="w-full md:w-3/4 lg:w-1/2">
                             <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 mb-2">
                                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <CardTitle>1. Formación del Grupo</CardTitle>
                                    <CardDescription>Ejemplo: 24 miembros, Capital de $12.000, Plazo de 12 meses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">Un grupo se completa y se activa. A cada miembro se le asigna un número de orden único para el sorteo (del 1 al 24).</p>
                                </CardContent>
                            </Card>
                        </div>
                       
                        <ArrowDown className="h-8 w-8 text-muted-foreground" />

                        <div className="w-full md:w-3/4 lg:w-1/2">
                             <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-2">
                                        <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle>2. Mes 1 - Primer Pago (Capitalización)</CardTitle>
                                    <CardDescription>Conformación de los fondos iniciales</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center mb-4">Los 24 miembros pagan su primera cuota. Aún no hay adjudicaciones, solo se capitalizan los fondos para asegurar la solvencia.</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold">Fondo General</h4>
                                            <p>24 miembros x $1.000 (alícuota pura) = <strong>$24.000</strong></p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold">Fondo de Reserva</h4>
                                            <p>Recibe el 50% de gastos adm. y derechos de suscripción de 24 cuotas.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                         <ArrowDown className="h-8 w-8 text-muted-foreground" />

                        <div className="w-full md:w-3/4 lg:w-1/2">
                            <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 mb-2">
                                        <Award className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <CardTitle>3. Mes 2 - Primer Acto de Adjudicación</CardTitle>
                                    <CardDescription>Se entregan los primeros 2 capitales de $12.000</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center mb-4">Con el pago de la segunda cuota, el Fondo General ya tiene suficiente para las primeras adjudicaciones.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold">Adjudicación por Sorteo</h4>
                                            <p>Un número de orden (1-24) sale sorteado. El miembro recibe $12.000.</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold">Adjudicación por Licitación</h4>
                                            <p>El miembro que ofrece adelantar más cuotas, gana y recibe $12.000. El capital de su oferta se integra al Fondo General.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <ArrowDown className="h-8 w-8 text-muted-foreground" />

                        <div className="w-full md:w-3/4 lg:w-1/2">
                            <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 mb-2">
                                        <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <CardTitle>4. Meses 3 a 11 - Ciclo Mensual y Mercado Secundario</CardTitle>
                                    <CardDescription>El proceso se repite y se habilita la subasta</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center mb-4">Cada mes se adjudican 2 nuevos miembros (1 por sorteo, 1 por licitación). A partir del 3er pago, los miembros pueden opcionalmente vender su plan en el Mercado Secundario (Subasta).</p>
                                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                                        <Hand className="h-4 w-4 text-primary" />
                                        <span>Opción de Subasta Habilitada</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <ArrowDown className="h-8 w-8 text-muted-foreground" />

                        <div className="w-full md-w-3/4 lg:w-1/2">
                             <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-2">
                                        <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <CardTitle>5. Mes 12 - Gran Adjudicación Final</CardTitle>
                                    <CardDescription>Se adjudican los últimos 4 miembros</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">En el último mes, se acelera el proceso para garantizar que todos los miembros restantes (4 en este ejemplo) reciban su capital. Se realizan 4 adjudicaciones por sorteo.</p>
                                </CardContent>
                            </Card>
                        </div>

                         <ArrowDown className="h-8 w-8 text-muted-foreground" />

                         <div className="w-full md-w-3/4 lg:w-1/2">
                             <Card className="shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-2">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <CardTitle>6. Cierre del Grupo</CardTitle>
                                    <CardDescription>Finalización y liquidación</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">Una vez que los 24 miembros han sido adjudicados y todas las cuotas pagadas, el grupo se cierra. Se realiza la liquidación final de los fondos y se devuelve el dinero a los miembros que se dieron de baja (si aplica).</p>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </CardContent>
             </Card>
        </>
    );
}
