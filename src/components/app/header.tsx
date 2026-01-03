
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MainNav } from "./main-nav"
import { Menu, PieChart, Gift, Landmark, HelpCircle, DollarSign } from "lucide-react"
import { Logo } from "../icons"
import Link from "next/link"
import { UserNav } from "./user-nav"
import { Button } from "../ui/button"
import { Notifications } from "./notifications"

export function Header() {
  const infoLinks = [
    { href: "/panel/transparency", label: "Transparencia", icon: PieChart },
    { href: "/panel/benefits", label: "Beneficios", icon: Gift },
    { href: "/panel/rules", label: "Reglamento", icon: Landmark },
    { href: "/panel/faq", label: "Preguntas Frecuentes", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {/* Desktop nav is in the sidebar */}
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
      <div className="flex w-full items-center justify-end gap-2">
         <div className="flex-1" />
         <div className="hidden md:flex items-center gap-1">
            {infoLinks.map(link => (
                <Button key={link.href} variant="ghost" asChild size="sm">
                    <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Link>
                </Button>
            ))}
         </div>
        <Notifications />
        <UserNav />
      </div>
    </header>
  )
}
