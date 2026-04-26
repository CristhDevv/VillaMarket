"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/store/cart";
import { CartConflictModal } from "@/components/cart/CartConflictModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartConflictModal />
      </CartProvider>
    </SessionProvider>
  );
}
