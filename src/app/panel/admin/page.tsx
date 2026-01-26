'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus } from 'lucide-react';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const adminSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
  });

  const onSubmit = (data: AdminFormValues) => {
    if (!firestore) {
      console.error("Servicio de Firestore no disponible.");
      return;
    }
    setIsLoading(true);

    const adminRef = doc(firestore, 'roles_admin', data.userId);
    const adminData = {};

    setDoc(adminRef, adminData)
      .catch((error: any) => {
        const permissionError = new FirestorePermissionError({
          path: adminRef.path,
          operation: 'create',
          requestResourceData: adminData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
        reset();
      });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">Gestión de roles y herramientas de mantenimiento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generador de Grupos
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Seed</div>
            <p className="text-xs text-muted-foreground">
              Crear grupos preestablecidos
            </p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/panel/admin/seed">Ir a Herramienta</Link>
            </Button>
          </CardContent>
        </Card>

        {/* NEW TEMPLATES CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plantillas
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Modelos</div>
            <p className="text-xs text-muted-foreground">
              Gestionar tipos de grupos
            </p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/panel/admin/templates">Ir a Herramienta</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gestión de Usuarios
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Usuarios</div>
            <p className="text-xs text-muted-foreground">
              Alta manual de usuarios
            </p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/panel/admin/users">Ir a Herramienta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Crear Administrador</CardTitle>
          <CardDescription>
            Ingresa el ID de un usuario para otorgarle privilegios de administrador. Esta acción es irreversible desde la UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID de Usuario (User ID)</Label>
              <Input
                id="userId"
                placeholder="Ej: aBcDeFgHiJkLmNoPqRsTuVwXyZ123"
                {...register('userId')}
              />
              {errors.userId && <p className="text-red-500 text-xs">{errors.userId.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Procesando...' : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Hacer Administrador
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
