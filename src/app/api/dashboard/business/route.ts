import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

// GET — Retorna el negocio del usuario autenticado
export async function GET() {
  const session = await getSession();
  if (!session) return apiError("No autorizado", 401);

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      category: { select: { id: true, name: true, slug: true, emoji: true } },
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { products: true, orders: { where: { status: "PENDING" } } } },
    },
  });

  return apiSuccess(business);
}

// POST — Crea negocio vinculado al usuario
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return apiError("No autorizado", 401);

  try {
    const existing = await prisma.business.findFirst({ where: { ownerId: session.user.id } });
    if (existing) return apiError("Ya tienes un negocio registrado", 409);

    const body = await req.json();
    const { name, categoryId, description, phone, address, whatsapp, instagram, facebook, website } = body;

    if (!name || !categoryId) return apiError("Nombre y categoría son obligatorios", 400);

    const baseSlug = slugify(name, { lower: true, strict: true });
    const existing2 = await prisma.business.findUnique({ where: { slug: baseSlug } });
    const slug = existing2 ? `${baseSlug}-${Date.now()}` : baseSlug;

    const business = await prisma.business.create({
      data: {
        name, slug, categoryId, description, phone, address,
        whatsapp, instagram, facebook, website,
        ownerId: session.user.id,
        status: "PENDING",
      },
    });

    return apiSuccess(business, 201);
  } catch {
    return apiError("Error al crear el negocio", 500);
  }
}

// PATCH — Actualiza negocio del usuario autenticado
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return apiError("No autorizado", 401);

  try {
    const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } });
    if (!business) return apiError("No tienes un negocio registrado", 404);

    const body = await req.json();
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: body,
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Error al actualizar el negocio", 500);
  }
}
