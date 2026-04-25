"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { MapPin, User, SignOut, CaretDown, Package, Storefront } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link href="/">
          <div>
            <span className="text-lg font-black text-foreground tracking-tight">
              Villa<span className="text-accent">Market</span>
            </span>
            <div className="flex items-center gap-0.5 -mt-0.5">
              <MapPin size={10} className="text-accent" weight="fill" />
              <span className="text-[10px] text-muted font-medium">Villa Rica, Cauca</span>
            </div>
          </div>
        </Link>

        {/* Right side */}
        {!session ? (
          <Link href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-accent px-4 py-2 rounded-pill active:scale-95 transition-all">
            Ingresar
          </Link>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 bg-surface border border-border rounded-pill px-3 py-1.5"
            >
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                <User size={12} className="text-accent" weight="fill" />
              </div>
              <span className="text-xs font-semibold text-foreground max-w-[80px] truncate">
                {session.user.name?.split(" ")[0] || "Yo"}
              </span>
              <CaretDown size={12} className="text-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-card shadow-lg z-50 overflow-hidden">
                <Link href="/mis-pedidos" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors">
                  <Package size={14} className="text-muted" /> Mis pedidos
                </Link>
                {(session.user.role === "OWNER" || session.user.role === "ADMIN") && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors border-t border-border">
                    <Storefront size={14} className="text-muted" /> Mi negocio
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full text-left border-t border-border transition-colors">
                  <SignOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
