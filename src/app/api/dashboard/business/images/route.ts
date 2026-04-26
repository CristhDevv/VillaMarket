import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: { images: true },
  });

  if (!business) return apiError("Negocio no encontrado", 404);

  return apiSuccess(business.images);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  try {
    const body = await req.json();
    const { url, publicId } = body;

    if (!url || !publicId) return apiError("url y publicId son requeridos", 400);

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { _count: { select: { images: true } } },
    });

    if (!business) return apiError("Negocio no encontrado", 404);

    if (business._count.images >= 6) {
      return apiError("No puedes tener más de 6 imágenes en la galería", 400);
    }

    const image = await prisma.businessImage.create({
      data: {
        url,
        publicId,
        businessId: business.id,
      },
    });

    return apiSuccess(image, 201);
  } catch (error) {
    return apiError("Error al guardar la imagen", 500);
  }
}
