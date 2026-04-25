"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { House, MagnifyingGlass, MapPin, Package } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const tabs = [
    { href: "/",          icon: House,           label: "Inicio"   },
    { href: "/negocios",  icon: MagnifyingGlass, label: "Buscar"   },
    { href: "/mapa",      icon: MapPin,          label: "Mapa"     },
    ...(session ? [{ href: "/mis-pedidos", icon: Package, label: "Pedidos" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                className={cn("transition-colors", active ? "text-accent" : "text-muted")}
              />
              <span className={cn("text-[10px] font-medium transition-colors", active ? "text-accent" : "text-muted")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
