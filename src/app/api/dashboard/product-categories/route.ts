import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function getBusinessForUser(userId: string) {
  return prisma.business.findFirst({ where: { ownerId: userId } });
}

// GET — Categorías propias del negocio
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await getBusinessForUser(session.user.id);
  if (!business) return apiError("No tienes un negocio", 404);

  const cats = await prisma.productCategory.findMany({
    where: { businessId: business.id },
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "asc" },
  });
  return apiSuccess(cats);
}

// POST — Crea categoría propia
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await getBusinessForUser(session.user.id);
  if (!business) return apiError("No tienes un negocio", 404);

  const { name } = await req.json();
  if (!name) return apiError("El nombre es obligatorio", 400);

  const cat = await prisma.productCategory.create({
    data: { name, businessId: business.id },
  });
  return apiSuccess(cat, 201);
}

// DELETE — Elimina categoría propia (query param ?id=...)
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const business = await getBusinessForUser(session.user.id);
  if (!business) return apiError("No tienes un negocio", 404);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("ID requerido", 400);

  const cat = await prisma.productCategory.findFirst({ where: { id, businessId: business.id } });
  if (!cat) return apiError("Categoría no encontrada o no autorizada", 404);

  await prisma.productCategory.delete({ where: { id } });
  return apiSuccess({ deleted: true });
}
