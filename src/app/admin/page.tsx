import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Storefront, Users, Package, ClipboardText } from "@phosphor-icons/react/dist/ssr";

async function getStats() {
  const [totalBusinesses, activeBusinesses, usersByRole, totalProducts, ordersByStatus] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { isActive: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.product.count(),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  return {
    businesses: { total: totalBusinesses, active: activeBusinesses },
    users: usersByRole.reduce((acc, curr) => ({ ...acc, [curr.role]: curr._count.role }), {} as Record<string, number>),
    products: totalProducts,
    orders: ordersByStatus.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.status }), {} as Record<string, number>),
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const totalUsers = Object.values(stats.users).reduce((a, b) => a + b, 0);
  const totalOrders = Object.values(stats.orders).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Resumen General</h1>
        <p className="text-sm text-muted mt-0.5">Supervisa la actividad de VillaMarket</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Negocios */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <Storefront size={20} className="text-accent" weight="fill" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.businesses.total}</p>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Negocios</p>
          <div className="mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-pill inline-block">
            {stats.businesses.active} activos
          </div>
        </div>

        {/* Usuarios */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <Users size={20} className="text-blue-600" weight="fill" />
          </div>
          <p className="text-2xl font-black text-foreground">{totalUsers}</p>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Usuarios</p>
          <div className="mt-2 flex gap-2 text-[10px] font-bold text-muted">
            <span title="Dueños">O: {stats.users["OWNER"] || 0}</span>
            <span title="Clientes">C: {stats.users["CUSTOMER"] || 0}</span>
            <span title="Admins">A: {stats.users["ADMIN"] || 0}</span>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
            <Package size={20} className="text-orange-600" weight="fill" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.products}</p>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Productos</p>
          <div className="mt-2 text-[10px] font-bold text-muted">
            Publicados en la plataforma
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
            <ClipboardText size={20} className="text-purple-600" weight="fill" />
          </div>
          <p className="text-2xl font-black text-foreground">{totalOrders}</p>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Pedidos</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-pill font-bold">
              {stats.orders["PENDING"] || 0} P
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-pill font-bold">
              {stats.orders["CONFIRMED"] || 0} C
            </span>
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-pill font-bold">
              {stats.orders["DELIVERED"] || 0} E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
