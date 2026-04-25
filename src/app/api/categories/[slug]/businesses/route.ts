import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip  = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { slug: resolvedParams.slug, isActive: true },
    });

    if (!category) return apiError("Categoría no encontrada", 404);

    const where = {
      categoryId: category.id,
      isActive: true,
      status: "APPROVED" as const,
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          images: { where: { isCover: true }, take: 1 },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);

    return apiSuccess({
      category,
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError("Error al obtener negocios de la categoría", 500);
  }
}
