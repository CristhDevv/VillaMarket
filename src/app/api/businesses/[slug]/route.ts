import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const business = await prisma.business.findUnique({
      where: {
        slug: resolvedParams.slug,
        isActive: true,
        status: "APPROVED",
      },
      include: {
        category: {
          select: { name: true, slug: true, emoji: true },
        },
        images: {
          orderBy: [{ isCover: "desc" }, { order: "asc" }],
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!business) return apiError("Negocio no encontrado", 404);

    // Calcular rating promedio
    const avgRating =
      business.reviews.length > 0
        ? business.reviews.reduce((acc, r) => acc + r.rating, 0) /
          business.reviews.length
        : null;

    return apiSuccess({ ...business, avgRating });
  } catch (error) {
    return apiError("Error al obtener el negocio", 500);
  }
}
