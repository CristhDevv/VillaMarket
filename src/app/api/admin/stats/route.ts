import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const [
    totalBusinesses,
    activeBusinesses,
    usersByRole,
    totalProducts,
    ordersByStatus
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { isActive: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.product.count(),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  return apiSuccess({
    businesses: { total: totalBusinesses, active: activeBusinesses },
    users: usersByRole.reduce((acc, curr) => {
      acc[curr.role] = curr._count.role;
      return acc;
    }, {} as Record<string, number>),
    products: totalProducts,
    orders: ordersByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>),
  });
}
