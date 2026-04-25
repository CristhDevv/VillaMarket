import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Package, 
  ClipboardText, 
  PencilSimple, 
  ArrowSquareOut,
  Storefront,
  CheckCircle,
  Clock,
  WarningCircle,
  ArrowRight
} from "@phosphor-icons/react/dist/ssr";

async function getDashboardData(userId: string) {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    include: {
      category: { select: { name: true, emoji: true } },
      _count: {
        select: {
          products: { where: { available: true } },
          orders: { where: { status: "PENDING" } },
        },
      },
    },
  });
  return business;
}

const statusConfig = {
  APPROVED: { label: "Aprobado", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  PENDING:  { label: "En revisión", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  REJECTED: { label: "Rechazado", icon: WarningCircle, color: "text-red-600 bg-red-50" },
  SUSPENDED:{ label: "Suspendido", icon: WarningCircle, color: "text-orange-600 bg-orange-50" },
};

export default async function DashboardPage() {
  const session = await auth();
  const business = await getDashboardData(session!.user.id);

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <Storefront size={40} className="text-accent" weight="light" />
        </div>
        <h1 className="text-2xl font-black text-foreground">¡Bienvenido a VillaMarket!</h1>
        <p className="text-muted text-sm mt-2 max-w-xs">
          Aún no tienes un negocio registrado. Crea el tuyo y empieza a recibir clientes.
        </p>
        <Link
          href="/dashboard/negocio"
          className="mt-8 px-8 py-3 bg-accent text-white font-bold rounded-pill active:scale-95 transition-all text-sm"
        >
          Registrar mi negocio
        </Link>
      </div>
    );
  }

  const status = statusConfig[business.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-foreground">Mi negocio</h1>
        <p className="text-sm text-muted mt-0.5">Gestiona tu presencia en VillaMarket</p>
      </div>

      {/* Tarjeta resumen */}
      <div className="bg-white border border-border rounded-card shadow-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{business.category.emoji}</span>
              <span className="text-xs font-medium text-muted">{business.category.name}</span>
            </div>
            <h2 className="text-xl font-black text-foreground">{business.name}</h2>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold flex-shrink-0 ${status.color}`}>
            <StatusIcon size={12} weight="fill" />
            {status.label}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-card p-3 text-center border border-border">
            <p className="text-2xl font-black text-accent">{business._count.products}</p>
            <p className="text-xs text-muted mt-0.5">Productos activos</p>
          </div>
          <Link
            href="/dashboard/pedidos?status=PENDING"
            className="bg-surface rounded-card p-3 text-center border border-border hover:border-accent/30 transition-colors"
          >
            <p className="text-2xl font-black text-foreground">{business._count.orders}</p>
            <p className="text-xs text-muted mt-0.5">Pedidos pendientes</p>
          </Link>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/dashboard/productos"
            className="flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-card text-sm font-bold active:scale-95 transition-all"
          >
            <Package size={16} weight="fill" />
            Productos
          </Link>
          <Link
            href="/dashboard/pedidos"
            className="flex items-center justify-center gap-2 bg-surface text-foreground border border-border py-2.5 rounded-card text-sm font-medium active:scale-95 transition-all"
          >
            <ClipboardText size={16} weight="fill" />
            Pedidos
          </Link>
          <Link
            href="/dashboard/negocio"
            className="flex items-center justify-center gap-2 bg-surface text-foreground border border-border py-2.5 rounded-card text-sm font-medium active:scale-95 transition-all"
          >
            <PencilSimple size={16} />
            Editar negocio
          </Link>
          <Link
            href={`/negocios/${business.slug}`}
            className="flex items-center justify-center gap-2 bg-surface text-foreground border border-border py-2.5 rounded-card text-sm font-medium active:scale-95 transition-all"
          >
            <ArrowSquareOut size={16} />
            Ver en directorio
          </Link>
        </div>
      </div>

      {business.status === "PENDING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4 text-sm">
          <p className="font-bold text-yellow-700">Tu negocio está en revisión</p>
          <p className="text-yellow-600 mt-1">
            Un administrador revisará tu información pronto. Una vez aprobado, aparecerá en el directorio.
          </p>
        </div>
      )}
    </div>
  );
}
