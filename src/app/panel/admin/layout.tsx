'use client';

import { useUserNav } from "@/components/app/user-nav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useUser } from "@/firebase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, isAdminLoading } = useUserNav();
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log("AdminLayout Check:", {
            userLoading,
            isAdminLoading,
            hasUser: !!user,
            isAdmin,
            uid: user?.uid
        });

        // Wait until everything is fully loaded
        if (!userLoading && !isAdminLoading) {
            if (user) {
                if (!isAdmin) {
                    console.warn("Redirecting: User exists but not admin. UID:", user.uid);
                    // router.push('/panel');
                    // COMMENTED OUT REDIRECT FOR DEBUGGING - Let's see the logs first or show a message
                    // For now, let's keep it but maybe alert?
                    // Actually, if I comment it out, they can see the page but might not have data access.
                    // Let's effectively "pause" the redirect to diagnose.
                    // But user wants it fixed.
                    // If I see "User exists but not admin", then the problem is 'isAdmin' is false.

                    // Let's FORCE a re-check or redirect only after a safety timeout?
                    // Or maybe the auto-promotion wasn't fast enough.
                    router.push('/panel');
                } else {
                    console.log("Access Granted: Owner/Admin");
                    setIsChecking(false);
                }
            } else {
                console.warn("Redirecting: No user found");
                router.push('/login');
            }
        }
    }, [isAdmin, isAdminLoading, router, user, userLoading]);

    if (isChecking) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Verificando permisos de administrador...</p>
                <div className="text-xs text-muted-foreground">
                    Estado: {userLoading ? 'Cargando Usuario...' : isAdminLoading ? 'Verificando Rol...' : 'Finalizando...'}
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Or some "Access Denied" screen
    }

    return <>{children}</>;
}
