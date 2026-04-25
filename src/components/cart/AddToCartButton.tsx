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
  const { addItem, conflictPending, resolveConflict } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const ok = addItem({ productId, name, price, businessId, businessName, businessSlug });
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <>
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

      {/* Conflict modal */}
      {conflictPending && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-black text-foreground">¿Cambiar negocio?</h3>
            <p className="text-sm text-muted">
              Tu carrito tiene productos de otro negocio. ¿Deseas vaciarlo y empezar un nuevo pedido?
            </p>
            <div className="flex gap-3">
              <button onClick={() => resolveConflict(false)}
                className="flex-1 h-11 bg-surface border border-border text-foreground font-medium rounded-pill text-sm">
                Cancelar
              </button>
              <button onClick={() => resolveConflict(true)}
                className="flex-1 h-11 bg-accent text-white font-bold rounded-pill text-sm">
                Vaciar y agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
