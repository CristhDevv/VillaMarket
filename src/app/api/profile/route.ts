import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      image: true,
    },
  });

  if (!user) return apiError("Usuario no encontrado", 404);

  return apiSuccess(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  try {
    const body = await req.json();
    const { name, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        image: true,
      },
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    return apiError("Error al actualizar el perfil", 500);
  }
}
