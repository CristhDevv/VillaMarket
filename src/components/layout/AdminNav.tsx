"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { SignOut, User, ChartBar, Storefront, Users } from "@phosphor-icons/react";

export function AdminNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", icon: ChartBar, label: "Resumen" },
    { href: "/admin/negocios", icon: Storefront, label: "Negocios" },
    { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-5xl mx-auto">
        <Link href="/admin">
          <span className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            Villa<span className="text-accent">Market</span>
            <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-pill font-bold uppercase tracking-wider">
              Admin
            </span>
          </span>
        </Link>

        {session && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Cerrar sesión"
            >
              <SignOut size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Menú de navegación inferior (mobile & desktop) */}
      <div className="bg-surface border-b border-border">
        <div className="flex overflow-x-auto no-scrollbar max-w-5xl mx-auto px-4">
          <div className="flex gap-6">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 py-3 text-sm font-bold transition-colors relative whitespace-nowrap ${
                    active ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
