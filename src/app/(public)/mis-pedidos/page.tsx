"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ClipboardText, Clock, CheckCircle, Truck, XCircle } from "@phosphor-icons/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface OrderSummary {
  id: string; status: OrderStatus; total: number; createdAt: string;
  business: { name: string; slug: string };
  items: { quantity: number; product: { name: string } }[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "Pendiente",  color: "text-yellow-700 bg-yellow-50",  icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "text-blue-700 bg-blue-50",      icon: CheckCircle },
  DELIVERED: { label: "Entregado",  color: "text-green-700 bg-green-50",    icon: Truck },
  CANCELLED: { label: "Cancelado",  color: "text-red-600 bg-red-50",        icon: XCircle },
};

export default function MisPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=/mis-pedidos");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then(r => r.json())
        .then(res => setOrders(res.data || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="text-center py-20 text-muted text-sm">Cargando pedidos...</div>;
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-foreground">Mis pedidos</h1>
        <p className="text-sm text-muted mt-0.5">{orders.length} pedidos realizados</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardText size={48} className="mx-auto text-muted mb-4" weight="light" />
          <p className="font-bold text-foreground">No tienes pedidos aún</p>
          <p className="text-sm text-muted mt-1">Explora los negocios y haz tu primer pedido</p>
          <Link href="/negocios"
            className="mt-6 inline-block px-8 py-3 bg-accent text-white font-bold rounded-pill text-sm">
            Explorar negocios
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            const itemsSummary = order.items
              .map(i => `${i.quantity}× ${i.product.name}`)
              .join(", ");

            return (
              <Link key={order.id} href={`/pedidos/${order.id}`}
                className="block bg-white border border-border rounded-card p-4 active:scale-[0.99] transition-all shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-foreground text-sm">{order.business.name}</p>
                    <p className="text-[10px] text-muted font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold ${cfg.color}`}>
                    <StatusIcon size={11} weight="fill" />
                    {cfg.label}
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-1">{itemsSummary}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted">
                    {format(new Date(order.createdAt), "d MMM, HH:mm", { locale: es })}
                  </span>
                  <span className="font-black text-foreground text-sm">
                    ${Number(order.total).toLocaleString("es-CO")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
