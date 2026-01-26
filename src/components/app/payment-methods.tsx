
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Banknote } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { MercadoPagoButton } from './mercadopago-button';

const cbuSchema = z.object({
    cbu: z.string().length(22, "El CBU debe tener 22 dígitos."),
    mandate: z.boolean().refine(val => val === true, {
        message: "Debes aceptar la adhesión al débito automático."
    })
});

type CbuFormValues = z.infer<typeof cbuSchema>;

export function PaymentMethods() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CbuFormValues>({
        resolver: zodResolver(cbuSchema),
        defaultValues: {
            cbu: "",
            mandate: false
        }
    });

    const onSubmit = (data: CbuFormValues) => {
        setIsLoading(true);
        console.log("CBU Guardado:", data.cbu);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "¡CBU Guardado!",
                description: "Tu CBU ha sido guardado y configurado para el débito automático.",
            });
        }, 1500);
    }

    return (
        <div className="w-full">
            <Alert className="mb-6">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>El débito automático es obligatorio</AlertTitle>
                <AlertDescription>
                    Para garantizar la solidez y el correcto funcionamiento del sistema, el pago de tu cuota se debita automáticamente en la fecha de vencimiento desde tu CBU principal.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5" />
                        Vincular CBU para Débito Automático
                    </CardTitle>
                    <CardDescription>La cuenta debe estar a nombre del titular de la cuenta en Group Dreaming.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="cbu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CBU (Clave Bancaria Uniforme)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ingresa los 22 dígitos de tu CBU" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mandate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Adhesión al Débito Automático
                                            </FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Autorizo a GROUP DREAMING S.A.S. a debitar de esta cuenta bancaria los importes correspondientes a las cuotas de mis planes de ahorro colectivo en sus respectivos vencimientos.
                                            </p>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar CBU'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5" />
                        Pagar con MercadoPago
                    </CardTitle>
                    <CardDescription>Prueba de integración de pago único o suscripción.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MercadoPagoButton
                        items={[
                            {
                                title: "Cuota Plan Ahorro",
                                quantity: 1,
                                unit_price: 1000
                            }
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
