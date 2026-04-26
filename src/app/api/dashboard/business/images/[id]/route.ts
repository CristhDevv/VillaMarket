import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { id } = await params;

  try {
    const businessImage = await prisma.businessImage.findUnique({
      where: { id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!businessImage) return apiError("Imagen no encontrada", 404);
    if (businessImage.business.ownerId !== session.user.id) {
      return apiError("No tienes permiso para eliminar esta imagen", 403);
    }

    // Delete from Cloudinary
    await deleteImage(businessImage.publicId).catch((err) => {
      console.error("Failed to delete image from Cloudinary:", err);
      // We continue to delete from DB even if Cloudinary fails, to not block the user
    });

    // Delete from DB
    await prisma.businessImage.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError("Error al eliminar la imagen", 500);
  }
}
