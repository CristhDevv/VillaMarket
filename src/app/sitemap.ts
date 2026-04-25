import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://villamarket.co';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/negocios`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Dynamic Categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/negocios?category=${cat.slug}`, // Or /categoria if strictly needed, but platform uses ?category
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic Businesses
  const businesses = await prisma.business.findMany({
    where: { isActive: true, status: 'APPROVED' },
    select: { slug: true, updatedAt: true },
  });

  const businessRoutes = businesses.map((biz) => ({
    url: `${baseUrl}/negocios/${biz.slug}`,
    lastModified: biz.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes, ...businessRoutes];
}
