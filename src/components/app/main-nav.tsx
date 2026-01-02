'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Gavel, LayoutDashboard, Search, Wallet, Users, Bot, PieChart, Shield, FileText, HelpCircle, Gift, Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge";

type MainNavProps = {
  isMobile?: boolean;
};

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();

  const routes = [
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
      href: "/panel/wallet",
      label: "Billetera",
      icon: Wallet,
    },
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
      {routes.map((route) => (
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
  )
}
