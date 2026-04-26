import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Comidas y Restaurantes", slug: "comidas", emoji: "🍽️", order: 1 },
  { name: "Ferreterías", slug: "ferreterias", emoji: "🔧", order: 2 },
  { name: "Salud y Farmacias", slug: "salud", emoji: "💊", order: 3 },
  { name: "Moda y Ropa", slug: "moda", emoji: "👗", order: 4 },
  { name: "Supermercados y Tiendas", slug: "tiendas", emoji: "🛒", order: 5 },
  { name: "Belleza y Peluquerías", slug: "belleza", emoji: "💈", order: 6 },
  { name: "Tecnología y Celulares", slug: "tecnologia", emoji: "📱", order: 7 },
  { name: "Transporte", slug: "transporte", emoji: "🚗", order: 8 },
  { name: "Educación", slug: "educacion", emoji: "📚", order: 9 },
  { name: "Servicios del Hogar", slug: "hogar", emoji: "🏠", order: 10 },
  { name: "Entretenimiento", slug: "entretenimiento", emoji: "🎉", order: 11 },
  { name: "Otros", slug: "otros", emoji: "📦", order: 12 },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  // Contraseña para todas las cuentas de prueba
  const hashedPassword = await bcrypt.hash("test1234", 10);

  // Categorías
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  ✓ ${category.emoji} ${category.name}`);
  }
  console.log("✅ 12 categorías creadas");

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@villamarket.com" },
    update: { 
      role: "ADMIN",
      password: hashedPassword 
    },
    create: {
      name: "Administrador",
      email: "admin@villamarket.com",
      role: "ADMIN",
      password: hashedPassword,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // Owner de prueba
  const owner = await prisma.user.upsert({
    where: { email: "owner@villamarket.com" },
    update: { 
      role: "OWNER",
      password: hashedPassword
    },
    create: {
      name: "Dueño Prueba",
      email: "owner@villamarket.com",
      role: "OWNER",
      password: hashedPassword,
    },
  });
  console.log(`  ✓ Owner: ${owner.email}`);

  // Customer de prueba
  const customer = await prisma.user.upsert({
    where: { email: "customer@villamarket.com" },
    update: { 
      role: "CUSTOMER",
      password: hashedPassword
    },
    create: {
      name: "Cliente Prueba",
      email: "customer@villamarket.com",
      role: "CUSTOMER",
      password: hashedPassword,
    },
  });
  console.log(`  ✓ Customer: ${customer.email}`);
  console.log("✅ Usuarios de prueba creados");

  // Create a sample business for testing
  const comidasCategory = await prisma.category.findUnique({ where: { slug: "comidas" } });
  
  if (comidasCategory) {
    await prisma.business.upsert({
      where: { slug: "restaurante-prueba" },
      update: {
        isActive: true,
        status: "APPROVED"
      },
      create: {
        name: "Restaurante de Prueba",
        slug: "restaurante-prueba",
        description: "El mejor restaurante de prueba en Villa Rica.",
        phone: "3001234567",
        address: "Calle de Prueba 123",
        categoryId: comidasCategory.id,
        ownerId: owner.id,
        isActive: true,
        status: "APPROVED",
        isFeatured: true
      }
    });
    console.log("✅ Negocio de prueba creado");
  }

  console.log("🎉 Seed completado exitosamente");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
