import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function getBusinessForUser(userId: string) {
  return prisma.business.findFirst({ where: { ownerId: userId } });
}

// GET — Lista productos del negocio
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await getBusinessForUser(session.user.id);
  if (!business) return apiError("No tienes un negocio registrado", 404);

  const products = await prisma.product.findMany({
    where: { businessId: business.id },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(products);
}

// POST — Crea producto
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  try {
    const business = await getBusinessForUser(session.user.id);
    if (!business) return apiError("No tienes un negocio registrado", 404);

    const { name, description, price, image, available, categoryId } = await req.json();
    if (!name || price === undefined) return apiError("Nombre y precio son obligatorios", 400);

    const product = await prisma.product.create({
      data: {
        name, description, price, image,
        available: available ?? true,
        businessId: business.id,
        categoryId: categoryId || null,
      },
    });

    return apiSuccess(product, 201);
  } catch {
    return apiError("Error al crear el producto", 500);
  }
}
