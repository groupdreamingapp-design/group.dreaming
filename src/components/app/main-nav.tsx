'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Gavel, LayoutDashboard, Search, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge";

type MainNavProps = {
  isMobile?: boolean;
};

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/explore-groups",
      label: "Explorar Grupos",
      icon: Search,
    },
    {
      href: "/dashboard/auctions",
      label: "Subastas",
      icon: Gavel,
      badge: "2"
    },
    {
      href: "/dashboard/wallet",
      label: "Billetera",
      icon: Wallet,
    },
  ];

  const linkClass = (href: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
    {
      "bg-muted text-primary": pathname === href,
      "justify-center": isMobile,
    }
  );

  return (
    <>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={linkClass(route.href)}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
          {route.badge && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">{route.badge}</Badge>
          )}
        </Link>
      ))}
    </>
  )
}
