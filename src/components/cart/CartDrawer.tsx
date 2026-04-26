"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, X, Minus, Plus, Trash, CaretDown } from "@phosphor-icons/react";
import { useCart } from "@/store/cart";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappSuccess, setWhatsappSuccess] = useState<{ url: string, orderId: string } | null>(null);
  const { items, count, total, removeItem, updateQuantity, clearCart, businessId, businessSlug } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on dashboard
  if (pathname.startsWith("/dashboard")) return null;

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!businessId || items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          note: note || undefined,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al hacer el pedido"); return; }

      clearCart();
      setNote("");
      
      if (data.data.whatsappUrl) {
        setWhatsappSuccess({ url: data.data.whatsappUrl, orderId: data.data.id });
      } else {
        setOpen(false);
        router.push(`/pedidos/${data.data.id}`);
      }
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (count === 0 && !open) return null;

  return (
    <>
      {/* FAB Button */}
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-accent text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
        >
          <ShoppingCart size={24} weight="fill" />
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        </button>
      )}

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col w-full max-w-lg mx-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-black text-foreground">Tu pedido</h2>
                <p className="text-xs text-muted">{items[0]?.businessName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                <X size={16} className="text-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map(item => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-accent font-bold">${(item.price * item.quantity).toLocaleString("es-CO")}</p>
                    <p className="text-[10px] text-muted">${item.price.toLocaleString("es-CO")} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.productId)}
                      className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center ml-1">
                      <Trash size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Nota */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-foreground mb-1 block">Instrucciones especiales</label>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="Ej: sin cebolla, entrega en puerta trasera..."
                  className="w-full px-3 py-2 rounded-card bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-safe pt-3 border-t border-border space-y-3">
              {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted font-medium">Total</span>
                <span className="text-xl font-black text-foreground">${total.toLocaleString("es-CO")}</span>
              </div>
              <button onClick={handleCheckout} disabled={loading}
                className="w-full h-12 bg-accent text-white font-bold rounded-pill disabled:opacity-70 active:scale-95 transition-all">
                {loading ? "Procesando..." : session ? "Hacer pedido" : "Ingresar para pedir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Success Modal */}
      {whatsappSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => {
            setWhatsappSuccess(null);
            setOpen(false);
            router.push(`/pedidos/${whatsappSuccess.orderId}`);
          }} />
          <div className="relative bg-white rounded-card p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">¡Pedido enviado!</h3>
            <p className="text-sm text-muted mb-6">
              Tu pedido se guardó correctamente. Notifica al negocio por WhatsApp para que lo preparen más rápido.
            </p>
            <div className="space-y-3">
              <a 
                href={whatsappSuccess.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => {
                  setWhatsappSuccess(null);
                  setOpen(false);
                  router.push(`/pedidos/${whatsappSuccess.orderId}`);
                }}
                className="flex items-center justify-center w-full h-12 bg-[#25D366] text-white font-bold rounded-pill active:scale-95 transition-all shadow-md"
              >
                Notificar al negocio por WhatsApp
              </a>
              <button 
                onClick={() => {
                  setWhatsappSuccess(null);
                  setOpen(false);
                  router.push(`/pedidos/${whatsappSuccess.orderId}`);
                }}
                className="w-full h-12 bg-surface text-foreground font-semibold rounded-pill active:scale-95 transition-all border border-border"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
