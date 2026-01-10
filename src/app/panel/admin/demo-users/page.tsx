
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clipboard, UserPlus, TestTube2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

function generateRandomPassword() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let password = '';
    for (let i = 0; i < 4; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

function generateDemoUsers() {
    return Array.from({ length: 100 }, (_, i) => {
        const userIndex = (i + 1).toString().padStart(3, '0');
        return {
            username: `USERDEMO${userIndex}`,
            password: generateRandomPassword(),
        };
    });
}

export default function DemoUsersPage() {
    const [demoUsers, setDemoUsers] = useState(generateDemoUsers);
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copiado al portapapeles',
            description: `${text} ha sido copiado.`,
        });
    };

    const handleCreateUser = (username: string, password: string) => {
        // In a real scenario, this would call Firebase Auth
        console.log(`Simulating user creation for ${username}`);
        toast({
            title: 'Usuario Creado (Simulación)',
            description: `El usuario ${username} se ha creado en Firebase Auth.`,
            className: 'bg-green-100 border-green-500 text-green-700',
        });
    };
    
    const handleRegenerate = () => {
        setDemoUsers(generateDemoUsers());
        toast({
            title: 'Contraseñas Regeneradas',
            description: 'Se ha generado un nuevo set de contraseñas aleatorias.',
        });
    }

    return (
        <>
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                    <Link href="/panel/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Administración
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                            <TestTube2 className="h-8 w-8 text-primary" />
                            Gestión de Usuarios Demo
                        </h1>
                        <p className="text-muted-foreground">Crea y gestiona usuarios de prueba para la plataforma.</p>
                    </div>
                     <Button onClick={handleRegenerate}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerar Contraseñas
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Usuarios de Demostración</CardTitle>
                    <CardDescription>
                        Utiliza estas credenciales para probar el sistema. Las contraseñas se generan de forma aleatoria en tu navegador y no se guardan en ningún lado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre de Usuario</TableHead>
                                    <TableHead>Contraseña</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {demoUsers.map((user) => (
                                    <TableRow key={user.username}>
                                        <TableCell className="font-mono">
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(user.username)}>
                                                <Clipboard className="mr-2 h-3 w-3" />
                                                {user.username}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-mono">
                                             <Button variant="ghost" size="sm" onClick={() => copyToClipboard(user.password)}>
                                                <Clipboard className="mr-2 h-3 w-3" />
                                                {user.password}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleCreateUser(user.username, user.password)}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Crear en Firebase (Sim)
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </>
    );
}
