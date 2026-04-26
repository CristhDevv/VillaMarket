import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const { id } = await params;
  const { isActive, isVerified } = await req.json();

  if (isActive !== undefined && typeof isActive !== "boolean") return apiError("isActive debe ser booleano", 400);
  if (isVerified !== undefined && typeof isVerified !== "boolean") return apiError("isVerified debe ser booleano", 400);

  try {
    const dataToUpdate: any = {};
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive;
      dataToUpdate.status = isActive ? "APPROVED" : "SUSPENDED";
    }
    if (isVerified !== undefined) {
      dataToUpdate.isVerified = isVerified;
    }

    const business = await prisma.business.update({
      where: { id },
      data: dataToUpdate,
    });
    return apiSuccess(business);
  } catch (error) {
    return apiError("Error al actualizar el negocio", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);
  const { id } = await params;
  try {
    const orderCount = await prisma.order.count({ where: { businessId: id } });
    if (orderCount > 0) {
      return apiError(
        `No se puede eliminar: el negocio tiene ${orderCount} pedido(s) registrado(s). Inactívalo en su lugar.`,
        409
      );
    }
    await prisma.business.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete business error:", error);
    return apiError("Error al eliminar el negocio", 500);
  }
}
