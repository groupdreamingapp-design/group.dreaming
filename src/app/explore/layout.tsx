
'use client';

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
       <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 w-full z-50 border-b">
        <Link href="/" className="flex items-center justify-center">
          <Logo className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold">Group Dreaming</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="flex gap-2">
            <Button asChild>
                <Link href={`/login?redirect=${pathname}`}>Ingresar o Probar Demo</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
         {children}
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Group Dreaming. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/faq" className="text-xs hover:underline underline-offset-4">Preguntas Frecuentes</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacidad</Link>
        </nav>
      </footer>
    </div>
  );
}
