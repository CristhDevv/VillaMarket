import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const { id } = await params;
  if (id === session.user.id) return apiError("No puedes cambiar tu propio rol", 400);

  const { role } = await req.json();
  if (!["CUSTOMER", "OWNER", "ADMIN"].includes(role)) return apiError("Rol inválido", 400);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return apiSuccess(user);
  } catch (error) {
    return apiError("Error al actualizar el usuario", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const { id } = await params;
  if (id === session.user.id) return apiError("No puedes eliminarte a ti mismo", 400);

  try {
    const activeOrdersCount = await prisma.order.count({
      where: { userId: id, status: { notIn: ["DELIVERED", "CANCELLED"] } },
    });

    if (activeOrdersCount > 0) {
      return apiError("No se puede eliminar un usuario con pedidos activos", 400);
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Error al eliminar el usuario", 500);
  }
}
