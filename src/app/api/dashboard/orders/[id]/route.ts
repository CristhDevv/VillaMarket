import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const FINAL_STATES = ["DELIVERED", "CANCELLED"];

// PATCH — Actualiza estado de un pedido del negocio del usuario
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { id } = await params;

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return apiError("No tienes un negocio registrado", 404);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return apiError("Pedido no encontrado", 404);
  if (order.businessId !== business.id) return apiError("No autorizado", 403);

  if (FINAL_STATES.includes(order.status)) {
    return apiError("Este pedido ya está en un estado final", 400);
  }

  const { status } = await req.json();
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["DELIVERED", "CANCELLED"],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return apiError(`No se puede cambiar de ${order.status} a ${status}`, 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, price: true } } } },
    },
  });

  return apiSuccess(updated);
}
