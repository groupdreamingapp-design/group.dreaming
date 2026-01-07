
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet as WalletIcon, Banknote, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";

// A simple component to represent the Mercado Pago logo
const MercadoPagoLogo = () => (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M22.0294 13.0182C22.0294 11.2307 20.5794 9.78069 18.7919 9.78069C17.0044 9.78069 15.5544 11.2307 15.5544 13.0182V26.8532L18.7919 28.5294L22.0294 26.8532V13.0182Z" fill="#00B1EA"/>
        <path d="M32.4457 13.0182C32.4457 11.2307 30.9957 9.78069 29.2082 9.78069C27.4207 9.78069 25.9707 11.2307 25.9707 13.0182V26.8532L29.2082 28.5294L32.4457 26.8532V13.0182Z" fill="#00B1EA"/>
        <path d="M38.2188 29.549C38.2188 28.5303 37.7719 27.5688 37.0125 26.9062L29.2094 20.575L21.8531 26.4594C21.4313 26.8125 21 27.2844 21 27.8438V34.5094L29.2094 38.2188L37.4188 34.5094V29.7688L38.2188 29.549Z" fill="#009EE3"/>
        <path d="M9.78125 29.549C9.78125 28.5303 10.2281 27.5688 10.9875 26.9062L18.7906 20.575L26.1469 26.4594C26.5687 26.8125 27 27.2844 27 27.8438V34.5094L18.7906 38.2188L10.5813 34.5094V29.7688L9.78125 29.549Z" fill="#009EE3"/>
    </svg>
);


export function PaymentMethods() {
    return (
        <div className="w-full">
            <div className="flex items-start justify-between space-x-2 rounded-lg border bg-background p-4 mb-6">
                <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                    <p className="text-sm font-semibold">El débito automático de cuotas es obligatorio</p>
                    <p className="text-xs text-muted-foreground">
                        Para garantizar la solidez del sistema, el pago de tu cuota se debita automáticamente en la fecha de vencimiento desde tu método de pago principal.
                    </p>
                </div>
            </div>
            
            <Tabs defaultValue="wallet-gd" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="wallet-gd"><WalletIcon className="mr-2 h-4 w-4"/>Wallet GD</TabsTrigger>
                    <TabsTrigger value="bank"><Banknote className="mr-2 h-4 w-4"/>Cuentas</TabsTrigger>
                    <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4"/>Tarjetas</TabsTrigger>
                    <TabsTrigger value="wallet-virtual">Billeteras</TabsTrigger>
                </TabsList>
                <TabsContent value="wallet-gd" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Group Dreaming</CardTitle>
                            <CardDescription>Usa tu saldo disponible en la plataforma. Es la opción por defecto y la más recomendada.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button>Establecer como Principal</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="bank" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cuentas Bancarias (CBU/CVU)</CardTitle>
                            <CardDescription>Vincula una cuenta bancaria o de billetera virtual para los débitos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cbu">CBU/CVU</Label>
                                <Input id="cbu" placeholder="0000000000000000000000" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="alias">Alias (Opcional)</Label>
                                <Input id="alias" placeholder="mi.alias.de.cuenta" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Agregar Cuenta</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="card" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Tarjetas de Crédito o Débito</CardTitle>
                            <CardDescription>Agrega una tarjeta para tus pagos. Se aplicará un costo de procesamiento.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="card-number">Número de Tarjeta</Label>
                                <Input id="card-number" placeholder="**** **** **** ****" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">Vencimiento</Label>
                                    <Input id="expiry-date" placeholder="MM/AA" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Agregar Tarjeta</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                 <TabsContent value="wallet-virtual" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Billeteras Virtuales</CardTitle>
                            <CardDescription>Conecta tu cuenta para autorizar el débito automático de tus cuotas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Al hacer clic en "Vincular", serás redirigido a Mercado Pago para autorizar a <strong>Group Dreaming</strong> a realizar débitos automáticos en tu cuenta para el pago de tus cuotas.
                            </p>
                            <Button asChild variant="outline" className="w-full justify-start text-base p-6">
                               <Link href="#">
                                  <MercadoPagoLogo />
                                  Vincular cuenta de Mercado Pago
                               </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

