import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  // Verificación estricta de rol ADMIN
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return apiError("No autorizado. Se requieren permisos de administrador.", 403);
  }

  try {
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return apiError("La nueva contraseña debe tener al menos 6 caracteres.", 400);
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en la base de datos
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return apiSuccess({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Admin password reset error:", error);
    return apiError("Error al resetear la contraseña", 500);
  }
}
