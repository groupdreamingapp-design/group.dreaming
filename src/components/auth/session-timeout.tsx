
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function SessionTimeout() {
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = useCallback(async () => {
        if (auth) {
            try {
                console.log("Sesión cerrada por inactividad");
                await signOut(auth);
                router.push('/');
            } catch (error) {
                console.error("Error al cerrar sesión por inactividad:", error);
            }
        }
    }, [auth, router]);

    useEffect(() => {
        if (!auth?.currentUser) return; // Sólo activar si hay usuario

        let timer: NodeJS.Timeout;

        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(handleLogout, TIMEOUT_MS);
        };

        // Eventos que reinician el timer
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Configurar listeners
        const setupListeners = () => {
            events.forEach(event => {
                window.addEventListener(event, resetTimer);
            });
            resetTimer(); // Iniciar timer
        };

        setupListeners();

        return () => {
            if (timer) clearTimeout(timer);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [auth?.currentUser, handleLogout]);

    return null; // Este componente no renderiza nada visual
}
