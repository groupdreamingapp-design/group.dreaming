
'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const protectedRoutes = ['/dashboard'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // If user state is still loading, don't do anything yet.
    if (user === undefined) return;
    
    // If user is not logged in and is trying to access a protected route, redirect to login.
    if (!user && isProtectedRoute) {
      router.push('/login');
    }

    // If user is logged in and is on a public-only page like login/register, redirect to dashboard.
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [user, isProtectedRoute, pathname, router]);


  // While authentication is loading on a protected route, show a loader
  if (user === undefined && isProtectedRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
