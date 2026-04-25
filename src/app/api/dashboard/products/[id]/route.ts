import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function verifyOwnership(userId: string, productId: string) {
  const business = await prisma.business.findFirst({ where: { ownerId: userId } });
  if (!business) return null;
  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  return product;
}

// PATCH — Edita producto
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { id } = await params;
  const product = await verifyOwnership(session.user.id, id);
  if (!product) return apiError("Producto no encontrado o no autorizado", 404);

  try {
    const body = await req.json();
    const updated = await prisma.product.update({ where: { id }, data: body });
    return apiSuccess(updated);
  } catch {
    return apiError("Error al actualizar el producto", 500);
  }
}

// DELETE — Elimina producto
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { id } = await params;
  const product = await verifyOwnership(session.user.id, id);
  if (!product) return apiError("Producto no encontrado o no autorizado", 404);

  try {
    await prisma.product.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Error al eliminar el producto", 500);
  }
}
