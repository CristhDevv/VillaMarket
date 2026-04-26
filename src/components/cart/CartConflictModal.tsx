"use client";

import { useCart } from "@/store/cart";

export function CartConflictModal() {
  const { conflictPending, resolveConflict } = useCart();

  if (!conflictPending) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-card w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Icono de advertencia visual */}
        <div className="w-14 h-14 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-foreground">¿Cambiar de negocio?</h3>
          <p className="text-sm text-muted leading-relaxed">
            Tu carrito ya contiene productos de otro negocio. 
            Si continúas, <span className="font-bold text-foreground">se vaciará el carrito actual</span> para empezar este nuevo pedido.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button 
            onClick={() => resolveConflict(true)}
            className="w-full h-11 bg-accent text-white font-bold rounded-pill text-sm active:scale-95 transition-all shadow-md"
          >
            Vaciar y agregar nuevo
          </button>
          <button 
            onClick={() => resolveConflict(false)}
            className="w-full h-11 bg-surface border border-border text-foreground font-bold rounded-pill text-sm active:scale-95 transition-all"
          >
            Mantener pedido actual
          </button>
        </div>
      </div>
    </div>
  );
}
