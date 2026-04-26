import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'owner@villamarket.com' },
    update: { password: pwd, role: 'OWNER' },
    create: { email: 'owner@villamarket.com', name: 'Test Owner', password: pwd, role: 'OWNER' }
  });
  
  await prisma.category.upsert({
    where: { slug: 'comidas' },
    update: {},
    create: { name: 'Comidas y Restaurantes', slug: 'comidas', emoji: '🍽️' }
  });
  
  console.log('User and category created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
