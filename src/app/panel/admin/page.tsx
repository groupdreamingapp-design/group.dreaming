'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus } from 'lucide-react';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const adminSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
  });

  const onSubmit = (data: AdminFormValues) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Servicio de Firestore no disponible.",
        });
        return;
    }
    setIsLoading(true);

    const adminRef = doc(firestore, 'roles_admin', data.userId);
    
    // We set an empty object because existence is what matters for this role.
    const adminData = {};

    setDoc(adminRef, adminData)
      .then(() => {
        toast({
          title: "¡Éxito!",
          description: `El usuario ${data.userId} ahora es administrador.`,
        });
        reset();
      })
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
      });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">Gestión de roles y privilegios de la plataforma.</p>
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
