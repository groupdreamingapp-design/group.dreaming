import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { GroupsProvider } from '@/components/app/providers';
import { AuthProvider } from '@/components/app/auth-provider';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Group Dreaming',
  description: 'El impulso para lo que de verdad importa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
        )}
      >
        <FirebaseClientProvider>
          <GroupsProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </GroupsProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
