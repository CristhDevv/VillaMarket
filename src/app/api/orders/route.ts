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
      
      // Validate stock if product has a stock limit
      if (product.stock !== null) {
        if (product.stock <= 0) {
          throw { statusCode: 400, message: `El producto "${product.name}" está agotado` };
        }
        if (product.stock < item.quantity) {
          throw { statusCode: 400, message: `Stock insuficiente para "${product.name}". Disponibles: ${product.stock}` };
        }
      }

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

      // Decrement stock for products with limited stock
      for (const item of items as { productId: string; quantity: number }[]) {
        const product = productMap.get(item.productId)!;
        if (product.stock !== null) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: newStock,
              available: newStock > 0,
            },
          });
        }
      }

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: { include: { product: { select: { name: true, price: true } } } },
          business: { select: { name: true, whatsapp: true } },
        },
      });
    });

    let whatsappUrl = null;
    if (order?.business.whatsapp) {
      const cleanPhone = order.business.whatsapp.replace(/\D/g, "");
      const phone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;
      
      const shortId = order.id.slice(-6).toUpperCase();
      let msg = `¡Nuevo pedido en VillaMarket! 🛒\n\n`;
      msg += `Pedido #${shortId}\n`;
      msg += `Cliente: ${session.user.name || "Cliente"}\n`;
      msg += `Productos:\n`;
      order.items.forEach((i) => {
        msg += `- ${i.quantity}x ${i.product.name} — $${Number(i.unitPrice) * i.quantity}\n`;
      });
      msg += `Total: $${total}\n`;
      if (note) msg += `Nota: ${note}\n`;
      msg += `\nVer pedido: https://villamarket.co/dashboard/pedidos`;
      
      whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }

    return apiSuccess({ ...order, whatsappUrl }, 201);
  } catch (error: any) {
    // Handle stock validation errors thrown as objects
    if (error?.statusCode && error?.message) {
      return apiError(error.message, error.statusCode);
    }
    console.error("Order creation error:", error);
    return apiError("Error al crear el pedido", 500);
  }
}
