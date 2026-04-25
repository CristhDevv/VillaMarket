import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const search = req.nextUrl.searchParams.get("search");
  const categoryId = req.nextUrl.searchParams.get("category");
  const activeStr = req.nextUrl.searchParams.get("active");

  const where: any = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (activeStr !== null) {
    where.isActive = activeStr === "true";
  }

  const businesses = await prisma.business.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, emoji: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  return apiSuccess(businesses);
}
