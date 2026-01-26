'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    role: z.enum(['user', 'admin']).default('user'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            role: 'user'
        }
    });

    const role = watch('role');

    const onSubmit = async (data: CreateUserFormValues) => {
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const resultData = await response.json();

            if (!response.ok) {
                // If it's a known error structure, use it. Otherwise use generic.
                const errorMessage = resultData.error || 'Error creando usuario. Verifica los datos.';
                // Check specifically for email existing in the error string if backend passes it through
                if (errorMessage.includes("email-already-in-use") || errorMessage.includes("The email address is already in use")) {
                    setResult({ success: false, message: "El correo electrónico ya está en uso por otra cuenta." });
                    toast({
                        title: "Email duplicado",
                        description: "El correo electrónico ya está registrado.",
                        variant: "destructive"
                    });
                    return;
                }
                throw new Error(errorMessage);
            }

            setResult({ success: true, message: `Usuario creado: ${resultData.email} (${resultData.uid})` });
            toast({
                title: "Usuario creado",
                description: "El usuario ha sido registrado exitosamente.",
                className: "bg-green-100 border-green-500 text-green-700"
            });
            reset();

        } catch (error: any) {
            setResult({ success: false, message: error.message });
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <UserPlus className="h-8 w-8 text-primary" />
                    Gestión de Usuarios
                </h1>
                <p className="text-muted-foreground">Alta manual de usuarios en la plataforma.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Usuario</CardTitle>
                    <CardDescription>
                        Registra un usuario directamente en Firebase Authentication.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {result && (
                        <Alert className={`mb-6 ${result.success ? 'bg-green-50 text-green-800 border-green-200' : 'variant="destructive"'}`}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? 'Éxito' : 'Error'}</AlertTitle>
                            <AlertDescription>
                                {result.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Nombre Completo</Label>
                            <Input id="displayName" placeholder="Juan Perez" {...register('displayName')} />
                            {errors.displayName && <p className="text-red-500 text-xs">{errors.displayName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register('email')} />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" placeholder="******" {...register('password')} />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol Inicial (Opcional)</Label>
                            <Select onValueChange={(val: any) => setValue('role', val)} defaultValue={role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuario Estándar</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Nota: Si seleccionas Admin, deberás asignarlo manualmente en la herramienta de roles también por seguridad.</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Usuario'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
