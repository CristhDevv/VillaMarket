"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { SignOut, User } from "@phosphor-icons/react";

export function DashboardNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <Link href="/dashboard">
          <span className="text-lg font-black text-foreground tracking-tight">
            Villa<span className="text-accent">Market</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <User size={14} className="text-accent" weight="fill" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {session?.user?.name?.split(" ")[0] || "Usuario"}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground bg-border/50 hover:bg-border px-3 py-1.5 rounded-pill transition-colors"
          >
            <SignOut size={14} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
