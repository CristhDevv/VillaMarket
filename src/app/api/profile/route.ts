import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return apiError("Usuario no encontrado", 404);
  }

  return apiSuccess(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { name, phone, currentPassword, newPassword } = await req.json();
    const updateData: any = {
      name: name?.trim() || undefined,
      phone: phone?.trim() || undefined,
    };

    // Lógica de cambio de contraseña
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user || !user.password) {
        return apiError("El usuario no tiene una contraseña establecida", 400);
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return apiError("La contraseña actual es incorrecta", 400);
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return apiError("Error al actualizar el perfil", 500);
  }
}
