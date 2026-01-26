'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';

// Componentes
import CreateMotoButton from '@/components/admin/create-moto-button';
import BoardRoom from '@/components/ai/board-room';

export default function BrainstormPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Escuchar si el usuario está conectado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("👮‍♂️ ESTADO USUARIO:", currentUser?.email);
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Función de Emergencia para Loguearse Manualmente
    const forceLogin = async () => {
        const email = prompt("Ingresa tu email:");
        const password = prompt("Ingresa tu contraseña:");
        if (!email || !password) return;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("✅ Login Forzado Exitoso. La barra debería ponerse verde.");
        } catch (error: any) {
            alert("❌ Error: " + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando sistema...</div>;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">

            {/* --- BLOQUE DE DIAGNÓSTICO --- */}
            <div className={`p-4 mb-8 rounded-lg text-white font-bold text-center flex flex-col gap-2 items-center justify-center ${user ? 'bg-green-600' : 'bg-red-600'}`}>
                {user ? (
                    <>
                        <span>✅ SISTEMA ONLINE: {user.email}</span>
                        <span className="text-xs opacity-75">UID: {user.uid}</span>
                    </>
                ) : (
                    <>
                        <span>❌ MODO INVITADO (Sin permisos de escritura)</span>
                        <button
                            onClick={forceLogin}
                            className="bg-white text-red-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition"
                        >
                            🔓 FORZAR INICIO DE SESIÓN AQUÍ
                        </button>
                    </>
                )}
            </div>

            {/* HEADER */}
            <header className="mb-10 max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Sala de Directorio <span className="text-purple-600">AI</span>
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                    Propón una idea y deja que tus 4 expertos la analicen simultáneamente.
                </p>
            </header>

            {/* LA MESA DE DISCUSIÓN */}
            <BoardRoom />

            {/* HERRAMIENTAS DE ADMIN (Solo visibles si estás logueado, o visibles para probar) */}
            <div className="mt-20 max-w-6xl mx-auto border-t pt-10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Herramientas de Ejecución
                </h3>

                {user ? (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex-1">
                            <h4 className="font-bold">Generador de Prototipos</h4>
                            <p className="text-sm text-gray-500">Crea el producto "Moto Honda" en la base de datos real.</p>
                        </div>
                        <CreateMotoButton />
                    </div>
                ) : (
                    <div className="bg-yellow-100 p-4 rounded text-yellow-800">
                        ⚠️ Debes iniciar sesión (Barra Verde) para ver el botón de crear productos.
                    </div>
                )}
            </div>

        </main>
    );
}