import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return apiError("No autorizado", 403);

  const search = req.nextUrl.searchParams.get("search");
  const role = req.nextUrl.searchParams.get("role");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { orders: { where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } } } },
    },
  });

  return apiSuccess(users);
}
