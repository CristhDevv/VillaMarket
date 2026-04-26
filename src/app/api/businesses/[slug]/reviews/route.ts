import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!business) return apiError("Negocio no encontrado", 404);

  const reviews = await prisma.review.findMany({
    where: { businessId: business.id, isVisible: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  });

  return apiSuccess(reviews);
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const role = session.user.role;
  if (role !== "CUSTOMER" && role !== "OWNER") {
    return apiError("No tienes permisos para dejar una reseña", 403);
  }

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });

  if (!business) return apiError("Negocio no encontrado", 404);

  // Dueño del negocio no puede reseñar su propio negocio
  if (business.ownerId === session.user.id) {
    return apiError("No puedes reseñar tu propio negocio", 400);
  }

  try {
    const body = await req.json();
    const { rating, comment } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return apiError("El rating debe ser un número entre 1 y 5", 400);
    }

    // Verificar si ya existe reseña
    const existing = await prisma.review.findUnique({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return apiError("Ya has dejado una reseña para este negocio", 409);
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment?.trim() || null,
        userId: session.user.id,
        businessId: business.id,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    return apiSuccess(review, 201);
  } catch (error) {
    return apiError("Error al crear la reseña", 500);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!business) return apiError("Negocio no encontrado", 404);

  try {
    const body = await req.json();
    const { rating, comment } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return apiError("El rating debe ser un número entre 1 y 5", 400);
    }

    const review = await prisma.review.update({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: session.user.id,
        },
      },
      data: {
        rating,
        comment: comment?.trim() || null,
      },
    });

    return apiSuccess(review);
  } catch (error) {
    return apiError("Error al actualizar la reseña", 500);
  }
}
