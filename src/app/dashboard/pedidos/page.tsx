"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardText, CheckCircle, Truck, XCircle, Clock } from "@phosphor-icons/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string; quantity: number; unitPrice: number;
  product: { name: string; price: number };
}

interface Order {
  id: string; status: OrderStatus; total: number; note?: string;
  createdAt: string;
  user: { name?: string; email: string };
  items: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "Pendiente",  color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "text-blue-700 bg-blue-50 border-blue-200",       icon: CheckCircle },
  DELIVERED: { label: "Entregado",  color: "text-green-700 bg-green-50 border-green-200",    icon: Truck },
  CANCELLED: { label: "Cancelado",  color: "text-red-600 bg-red-50 border-red-200",          icon: XCircle },
};

const TABS: { key: string; label: string }[] = [
  { key: "ALL",       label: "Todos"       },
  { key: "PENDING",   label: "Pendientes"  },
  { key: "CONFIRMED", label: "Confirmados" },
  { key: "DELIVERED", label: "Entregados"  },
  { key: "CANCELLED", label: "Cancelados"  },
];

export default function PedidosPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("status") || "ALL";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const url = activeTab === "ALL" ? "/api/dashboard/orders" : `/api/dashboard/orders?status=${activeTab}`;
    const res = await fetch(url).then(r => r.json());
    setOrders(res.data || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionError("");
    // Optimistic update
    const prev = orders.find(o => o.id === orderId)!;
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const res = await fetch(`/api/dashboard/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Revert on failure
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: prev.status } : o));
      const data = await res.json();
      setActionError(data.error || "Error al actualizar el pedido");
    } else if (activeTab !== "ALL") {
      // Remove from current filtered view
      setOrders(os => os.filter(o => o.id !== orderId));
    }
  };

  const emptyMessages: Record<string, string> = {
    ALL: "No tienes pedidos aún", PENDING: "No tienes pedidos pendientes",
    CONFIRMED: "No tienes pedidos confirmados", DELIVERED: "No tienes pedidos entregados",
    CANCELLED: "No tienes pedidos cancelados",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-foreground">Pedidos</h1>
        <p className="text-sm text-muted mt-0.5">{orders.length} pedidos encontrados</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex gap-2 pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-pill text-xs font-bold transition-colors ${
                activeTab === tab.key ? "bg-accent text-white" : "bg-surface text-foreground border border-border"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-card text-sm font-medium">{actionError}</div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted text-sm">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-card bg-surface">
          <ClipboardText size={40} className="mx-auto text-muted mb-3" weight="light" />
          <p className="text-sm font-medium text-foreground">{emptyMessages[activeTab]}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="bg-white border border-border rounded-card shadow-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <p className="text-xs text-muted font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm font-bold text-foreground">{order.user.name || "Cliente"}</p>
                    <p className="text-[11px] text-muted">{order.user.email}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-pill border text-xs font-bold ${cfg.color}`}>
                    <StatusIcon size={12} weight="fill" />
                    {cfg.label}
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 py-3 space-y-1.5 border-b border-border">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        <span className="font-medium text-accent mr-1">×{item.quantity}</span>
                        {item.product.name}
                      </span>
                      <span className="text-muted text-xs font-medium">
                        ${(Number(item.unitPrice) * item.quantity).toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}
                  {order.note && (
                    <p className="text-[11px] text-muted italic mt-2 pt-2 border-t border-border">
                      Nota: {order.note}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black text-foreground">
                      ${Number(order.total).toLocaleString("es-CO")}
                    </p>
                    <p className="text-[11px] text-muted">
                      {format(new Date(order.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {order.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "CONFIRMED")}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-pill active:scale-95 transition-all">
                          Confirmar
                        </button>
                        <button onClick={() => updateStatus(order.id, "CANCELLED")}
                          className="px-3 py-1.5 bg-surface border border-border text-red-500 text-xs font-bold rounded-pill active:scale-95 transition-all">
                          Cancelar
                        </button>
                      </>
                    )}
                    {order.status === "CONFIRMED" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "DELIVERED")}
                          className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-pill active:scale-95 transition-all">
                          Entregado
                        </button>
                        <button onClick={() => updateStatus(order.id, "CANCELLED")}
                          className="px-3 py-1.5 bg-surface border border-border text-red-500 text-xs font-bold rounded-pill active:scale-95 transition-all">
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
