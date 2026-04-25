import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

async function getBusinessForUser(userId: string) {
  return prisma.business.findFirst({ where: { ownerId: userId } });
}

// GET — Pedidos del negocio, filtrable por status
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await getBusinessForUser(session.user.id);
  if (!business) return apiError("No tienes un negocio registrado", 404);

  const status = req.nextUrl.searchParams.get("status") || undefined;

  const orders = await prisma.order.findMany({
    where: {
      businessId: business.id,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, price: true } },
        },
      },
    },
  });

  return apiSuccess(orders);
}
