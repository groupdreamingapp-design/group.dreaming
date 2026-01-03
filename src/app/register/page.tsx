
'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth/google-auth';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { FirebaseError } from 'firebase/app';
import { ArrowLeft, UserCheck } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.464,34.023,48,29.397,48,24C48,22.659,47.862,21.35,47.611,20.083z" />
  </svg>
);

function RegisterPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();


  const handleSuccess = () => {
    const redirectUrl = searchParams.get('redirect') || '/panel/profile';
    toast({
      title: "¡Acceso exitoso!",
      description: "Hemos creado tu sesión. Redirigiendo...",
    });
    router.push(redirectUrl);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      await signInWithGoogle(auth);
      handleSuccess();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const handleAnonymousSignIn = async () => {
    setIsAnonymousLoading(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      await initiateAnonymousSignIn(auth);
      handleSuccess();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
        setIsAnonymousLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
     let title = 'Error al registrarse';
    let description = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          title = 'Email en uso';
          description = 'Este email ya está registrado. Intenta iniciar sesión.';
          break;
        case 'auth/weak-password':
          title = 'Contraseña débil';
          description = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/popup-closed-by-user':
          title = 'Ventana cerrada';
          description = 'El registro con Google fue cancelado.';
          break;
        default:
          description = error.message;
          break;
      }
    }
    
    toast({
        variant: "destructive",
        title: title,
        description: description,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md relative">
         <Button variant="ghost" size="sm" className="absolute top-4 left-4" asChild>
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
            </Link>
        </Button>
        <CardHeader className="text-center pt-16">
          <div className="flex justify-center mb-4">
              <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Crea tu cuenta</CardTitle>
          <CardDescription>Elige una opción para empezar a construir tus sueños.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading || isAnonymousLoading}>
                   {isGoogleLoading ? 'Cargando...' : <><GoogleIcon className="mr-2" /> Ingresar con Google</>}
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleAnonymousSignIn} disabled={isLoading || isGoogleLoading || isAnonymousLoading}>
                    {isAnonymousLoading ? 'Cargando...' : <><UserCheck className="mr-2" /> Probar Demo (Ingreso anónimo)</>}
                </Button>
                <Separator className="my-6" />
                <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <RegisterPageContent />
        </Suspense>
    )
}
