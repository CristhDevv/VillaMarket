import { prisma } from "@/lib/prisma";

export async function getBusinesses({
  search = "",
  category = "",
  page = 1,
  limit = 12,
  featured = false,
}: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    status: "APPROVED" as const,
    ...(featured && { isFeatured: true }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && {
      category: { slug: category },
    }),
  };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        category: {
          select: { name: true, slug: true, emoji: true },
        },
        images: {
          where: { isCover: true },
          take: 1,
        },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.business.count({ where }),
  ]);

  return {
    businesses,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
