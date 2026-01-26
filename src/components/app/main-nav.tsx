
'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Gavel, LayoutDashboard, Search, Users, PieChart, Shield, HelpCircle, Gift, Landmark, Bell, Waves, TestTube2, BookText } from "lucide-react"
import { useUserNav } from "./user-nav";


type MainNavProps = {
  isMobile?: boolean;
};

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();
  const { isAdmin } = useUserNav();

  const commonRoutes = [
    {
      href: "/panel",
      label: "Mi Panel",
      icon: LayoutDashboard,
    },
    {
      href: "/panel/my-groups",
      label: "Mis Grupos",
      icon: Users,
    },
    {
      href: "/panel/notifications",
      label: "Notificaciones",
      icon: Bell,
    },
    {
      href: "/panel/explore",
      label: "Explorar Grupos",
      icon: Search,
    },
    {
      href: "/panel/auctions",
      label: "Subastas",
      icon: Gavel,
    },
    {
      href: "/panel/profile",
      label: "Mi Perfil",
      icon: Shield,
    },
    {
      href: "/panel/comparisons",
      label: "Comparativas",
      icon: PieChart,
    },
  ];

  const infoRoutes = [
    { href: "/panel/how-it-works", label: "Cómo Funciona", icon: BookText },
    { href: "/panel/benefits", label: "Beneficios", icon: Gift },
    { href: "/panel/rules", label: "Reglamento", icon: Landmark },
    { href: "/panel/compliance", label: "Marco Legal", icon: Landmark },
    { href: "/panel/faq", label: "Preguntas Frecuentes", icon: HelpCircle },
  ]

  const adminRoutes = [
    {
      href: "/panel/admin",
      label: "Administración",
      icon: Shield,
    },
    {
      href: "/panel/admin/collection-map",
      label: "Mapa de Cobranza",
      icon: Waves,
    },
    {
      href: "/panel/admin/demo-users",
      label: "Usuarios Demo",
      icon: TestTube2,
    }
  ];

  const linkClass = (href: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
    {
      "bg-muted text-primary": pathname.startsWith(href) && href !== "/panel" || pathname === href,
      "justify-center": isMobile,
    }
  );

  return (
    <>
      {commonRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={linkClass(route.href)}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}

      <div className="px-3 py-2 mt-4">
        <span className="text-xs font-semibold text-muted-foreground">Información</span>
      </div>
      {infoRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={linkClass(route.href)}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
      {isAdmin && (
        <>
          <div className="px-3 py-2 mt-4">
            <span className="text-xs font-semibold text-muted-foreground">Admin</span>
          </div>
          {adminRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={linkClass(route.href)}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </>
      )}
    </>
  )
}
