import { UserNav } from "@/components/app/user-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MainNav } from "./main-nav"
import { Menu } from "lucide-react"
import { Logo } from "../icons"
import Link from "next/link"
import { Button } from "../ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {/* Desktop nav is in the sidebar, this is a placeholder for the logo */}
         <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Button variant="ghost" asChild><Link href="/">Por qué nosotros</Link></Button>
          <Button variant="ghost" asChild><Link href="/dashboard/explore">Explorar Grupos</Link></Button>
          <Button variant="ghost" asChild><Link href="/dashboard/transparency">Transparencia</Link></Button>
        </div>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden p-2 -ml-2 rounded-md focus:bg-accent focus:text-accent-foreground">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Group Dreaming</span>
            </Link>
            <MainNav isMobile={true} />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <UserNav />
      </div>
    </header>
  )
}
