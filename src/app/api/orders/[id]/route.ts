import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

// GET — Detalle de un pedido (solo si pertenece al usuario)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, price: true, image: true } } } },
      business: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) return apiError("Pedido no encontrado", 404);
  if (order.userId !== session.user.id) return apiError("No autorizado", 403);

  return apiSuccess(order);
}
