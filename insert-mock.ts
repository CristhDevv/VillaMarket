import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Check if owner exists, else create
  let owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: "testowner@villamarket.com",
        name: "Dueño de Prueba",
        role: "OWNER",
      }
    });
  }

  // Get first category
  const category = await prisma.category.findFirst({ where: { slug: "comidas" } });
  if (!category) throw new Error("Category comidas not found");

  // Upsert business
  await prisma.business.upsert({
    where: { slug: "restaurante-la-sazon" },
    update: {},
    create: {
      name: "Restaurante La Sazón",
      slug: "restaurante-la-sazon",
      description: "El mejor restaurante de comida tradicional en Villa Rica. Almuerzos corrientes, platos a la carta y domicilios rápidos.",
      categoryId: category.id,
      ownerId: owner.id,
      phone: "3201234567",
      whatsapp: "573201234567",
      address: "Calle 4 # 5-60, Centro",
      latitude: 3.1678,
      longitude: -76.4321,
      isVerified: true,
      isActive: true,
      isFeatured: true,
      status: "APPROVED",
      schedule: {
        lunes: { open: "08:00", close: "18:00" },
        martes: { open: "08:00", close: "18:00" },
        miercoles: { open: "08:00", close: "18:00" },
        jueves: { open: "08:00", close: "18:00" },
        viernes: { open: "08:00", close: "20:00" },
        sabado: { open: "09:00", close: "20:00" },
        domingo: { open: "09:00", close: "15:00" }
      },
      reviews: {
        create: [
          {
            rating: 5,
            comment: "Excelente comida y el servicio es muy bueno. Recomendado.",
            user: {
              create: {
                name: "Carlos Martínez",
                email: "carlos.m@example.com",
                role: "USER"
              }
            }
          }
        ]
      }
    }
  });

  console.log("Mock business inserted.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
