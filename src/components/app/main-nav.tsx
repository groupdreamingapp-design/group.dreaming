
'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Gavel, LayoutDashboard, Search, Users, PieChart, Shield, HelpCircle, Gift, Landmark, Bell, Waves } from "lucide-react"
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

  const adminRoutes = [
    {
      href: "/panel/admin",
      label: "Crear Admin",
      icon: Shield,
    },
     {
      href: "/panel/admin/collection-map",
      label: "Mapa de Cobranza",
      icon: Waves,
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
        <>
            <div className="px-3 py-2">
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
    </>
  )
}

