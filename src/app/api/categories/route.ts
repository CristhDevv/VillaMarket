import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            businesses: {
              where: { isActive: true, status: "APPROVED" },
            },
          },
        },
      },
    });

    return apiSuccess(categories);
  } catch (error) {
    return apiError("Error al obtener categorías", 500);
  }
}
