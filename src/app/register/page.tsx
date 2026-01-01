
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
      toast({
        title: "¡Cuenta Creada!",
        description: "Bienvenido a Group Dreaming. Serás redirigido a tu panel.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso. Intenta iniciar sesión.";
      } else if (error.code === 'auth/weak-password') {
        description = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
      }
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description,
      });
      console.error("Error creating user", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para comenzar a cumplir tus sueños
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nombre completo</Label>
              <Input 
                id="full-name" 
                placeholder="Juan Perez" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Crear cuenta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline">
              Ingresar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
