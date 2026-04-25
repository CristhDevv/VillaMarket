import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET — Lista pedidos del usuario autenticado
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, slug: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return apiSuccess(orders);
}

// POST — Crea un pedido nuevo (cliente)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  try {
    const { businessId, items, note } = await req.json();

    if (!businessId || !items?.length) {
      return apiError("businessId e items son requeridos", 400);
    }

    // Verificar que el negocio existe
    const business = await prisma.business.findUnique({
      where: { id: businessId, isActive: true, status: "APPROVED" },
    });
    if (!business) return apiError("Negocio no encontrado o no disponible", 404);

    // Verificar productos y calcular total
    const productIds: string[] = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, businessId, available: true },
    });

    if (products.length !== productIds.length) {
      return apiError("Uno o más productos no están disponibles", 400);
    }

    const productMap = new Map(products.map(p => [p.id, p]));
    let total = 0;
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    // Crear pedido con items en transacción
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          businessId,
          total,
          note: note || null,
          status: "PENDING",
        },
      });

      await tx.orderItem.createMany({
        data: orderItems.map((item: any) => ({ ...item, orderId: newOrder.id })),
      });

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: { include: { product: { select: { name: true, price: true } } } },
          business: { select: { name: true } },
        },
      });
    });

    return apiSuccess(order, 201);
  } catch (error) {
    console.error("Order creation error:", error);
    return apiError("Error al crear el pedido", 500);
  }
}
