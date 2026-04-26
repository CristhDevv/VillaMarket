import { prisma } from "@/lib/prisma";

export async function getBusinesses({
  search = "",
  category = "",
  page = 1,
  limit = 12,
  featured = false,
  verified = false,
  open = false,
  priceRange,
}: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  verified?: boolean;
  open?: boolean;
  priceRange?: string;
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
    ...(verified && { isVerified: true }),
  };

  const businesses = await prisma.business.findMany({
      where,
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
        products: { select: { price: true, available: true } },
      },
    });

  let filtered = businesses;

  // Filter by priceRange
  if (priceRange && ["low", "medium", "high"].includes(priceRange)) {
    filtered = filtered.filter((biz) => {
      const activeProducts = biz.products.filter(p => p.available);
      if (activeProducts.length === 0) return false;
      const avg = activeProducts.reduce((sum, p) => sum + Number(p.price), 0) / activeProducts.length;
      if (priceRange === "low") return avg < 20000;
      if (priceRange === "medium") return avg >= 20000 && avg <= 80000;
      if (priceRange === "high") return avg > 80000;
      return true;
    });
  }

  // Filter by open
  if (open) {
    const now = new Date();
    // adjust to Colombia timezone roughly, or just use system local if we assume server is local
    // Next.js server local time might be UTC. Let's use local timezone string
    const options = { timeZone: "America/Bogota", hour: '2-digit', minute: '2-digit', hour12: false } as const;
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(now); // e.g., "14:30"
    const dayIndex = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" })).getDay();
    const dayMap: Record<number, string> = { 0: "domingo", 1: "lunes", 2: "martes", 3: "miercoles", 4: "jueves", 5: "viernes", 6: "sabado" };
    const todayStr = dayMap[dayIndex];

    filtered = filtered.filter(biz => {
      if (!biz.schedule) return true; // Si no tiene horario, se considera abierto siempre
      const schedule = biz.schedule as Record<string, { open: string; close: string }>;
      const todaySchedule = schedule[todayStr];
      if (!todaySchedule) return false; // Not open today
      return timeStr >= todaySchedule.open && timeStr <= todaySchedule.close;
    });
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    businesses: paginated,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
