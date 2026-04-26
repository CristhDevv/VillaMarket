"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  businessId: string;
  businessName: string;
  businessSlug: string;
  available: boolean;
}

export function AddToCartButton({ productId, name, price, businessId, businessName, businessSlug, available }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const ok = addItem({ productId, name, price, businessId, businessName, businessSlug });
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!available}
      className={`w-full mt-3 py-2 text-xs font-bold rounded-pill transition-all active:scale-95 ${
        !available
          ? "bg-surface border border-border text-muted cursor-not-allowed"
          : added
          ? "bg-green-500 text-white"
          : "bg-accent text-white"
      }`}
    >
      {!available ? "Agotado" : added ? "✓ Agregado" : "Agregar al pedido"}
    </button>
  );
}
