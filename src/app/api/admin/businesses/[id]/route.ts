import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const { id } = await params;
  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") return apiError("isActive es requerido y debe ser booleano", 400);

  try {
    const business = await prisma.business.update({
      where: { id },
      data: { isActive, status: isActive ? "APPROVED" : "SUSPENDED" }, // Update status alongside isActive
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
    await prisma.business.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Error al eliminar el negocio", 500);
  }
}
