
'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Gavel, LayoutDashboard, Search, Users, PieChart, Shield, HelpCircle, Gift, Landmark, Bell, Waves, TestTube2, BookText } from "lucide-react"
import { useUserNav } from "./user-nav";
import { useLanguage } from "./language-provider";


type MainNavProps = {
  isMobile?: boolean;
};

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();
  const { isAdmin } = useUserNav();
  const { t } = useLanguage();

  const commonRoutes = [
    {
      href: "/panel",
      label: t('nav.my_dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: "/panel/my-groups",
      label: t('nav.my_groups'),
      icon: Users,
    },
    {
      href: "/panel/notifications",
      label: t('nav.notifications'),
      icon: Bell,
    },
    {
      href: "/panel/explore",
      label: t('nav.explore_groups'),
      icon: Search,
    },
    {
      href: "/panel/auctions",
      label: t('nav.auctions'),
      icon: Gavel,
    },
    {
      href: "/panel/profile",
      label: t('nav.my_profile'),
      icon: Shield,
    },
    {
      href: "/panel/comparisons",
      label: t('nav.comparisons'),
      icon: PieChart,
    },
  ];

  const infoRoutes = [
    { href: "/panel/how-it-works", label: t('nav.how_it_works'), icon: BookText },
    { href: "/panel/benefits", label: t('nav.benefits'), icon: Gift },
    { href: "/panel/rules", label: t('nav.rules'), icon: Landmark },
    { href: "/panel/compliance", label: t('nav.compliance'), icon: Landmark },
    { href: "/panel/faq", label: t('nav.faq'), icon: HelpCircle },
  ]

  const adminRoutes = [
    {
      href: "/panel/admin",
      label: t('nav.administration'),
      icon: Shield,
    },
    {
      href: "/panel/admin/collection-map",
      label: t('nav.collection_map'),
      icon: Waves,
    },
    {
      href: "/panel/admin/demo-users",
      label: t('nav.demo_users'),
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
