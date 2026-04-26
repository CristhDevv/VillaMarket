import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, Clock, Truck, XCircle } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Forzar revalidación cada 30 segundos para actualizar el estado del pedido
export const revalidate = 30;

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "Pendiente",  color: "text-yellow-700 bg-yellow-50",  icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "text-blue-700 bg-blue-50",      icon: CheckCircle },
  DELIVERED: { label: "Entregado",  color: "text-green-700 bg-green-50",    icon: Truck },
  CANCELLED: { label: "Cancelado",  color: "text-red-600 bg-red-50",        icon: XCircle },
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true } } } },
      business: { select: { name: true, slug: true } },
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const status = order.status as OrderStatus;
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 max-w-lg mx-auto text-center">
      {/* Ícono de éxito */}
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-accent" weight="fill" />
      </div>

      <h1 className="text-2xl font-black text-foreground">¡Pedido recibido!</h1>
      <p className="text-sm text-muted mt-2 max-w-xs">
        El negocio se comunicará contigo pronto para confirmar tu pedido.
      </p>

      {/* Badge de Estado */}
      <div className="mt-6 flex justify-center">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold ${cfg.color}`}>
          <StatusIcon size={18} weight="fill" />
          {cfg.label}
        </div>
      </div>

      {/* Número de pedido */}
      <div className="mt-4 bg-surface border border-border rounded-card px-5 py-3 w-full">
        <p className="text-xs text-muted font-medium">Número de pedido</p>
        <p className="text-lg font-black text-foreground font-mono tracking-wider">
          #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-xs text-muted mt-1">
          {format(new Date(order.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
        </p>
      </div>

      {/* Negocio */}
      <div className="mt-4 w-full bg-surface border border-border rounded-card px-5 py-4 text-left space-y-3">
        <p className="text-xs text-muted font-medium">Negocio</p>
        <p className="text-sm font-bold text-foreground">{order.business.name}</p>

        <div className="border-t border-border pt-3 space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                <span className="font-bold text-accent mr-1">×{item.quantity}</span>
                {item.product.name}
              </span>
              <span className="font-bold text-foreground">
                ${(Number(item.unitPrice) * item.quantity).toLocaleString("es-CO")}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="text-lg font-black text-foreground">${Number(order.total).toLocaleString("es-CO")}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-3 w-full mt-6">
        <Link href="/mis-pedidos"
          className="w-full h-12 bg-accent text-white font-bold rounded-pill flex items-center justify-center text-sm">
          Ver mis pedidos
        </Link>
        <Link href={`/negocios/${order.business.slug}`}
          className="w-full h-12 bg-surface border border-border text-foreground font-medium rounded-pill flex items-center justify-center text-sm">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
