import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { GroupsProvider } from '@/components/app/providers';
import { UserNavProvider } from '@/components/app/user-nav';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { WhatsAppButton } from '@/components/app/whatsapp-button';
import { Chatbot } from '@/components/Chatbot';
import { SessionTimeout } from '@/components/auth/session-timeout';

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
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
        )}
      >
        <FirebaseClientProvider>
          <UserNavProvider>
            <GroupsProvider>
              <SessionTimeout />
              {children}
            </GroupsProvider>
          </UserNavProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Chatbot />
        <WhatsAppButton phoneNumber="5491112345678" />
      </body>
    </html>
  );
}
