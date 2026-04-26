import { SearchBar } from "@/components/shared/SearchBar";
import { CategoryCard } from "@/components/business/CategoryCard";
import { BusinessCard } from "@/components/business/BusinessCard";
import { prisma } from "@/lib/prisma";
import {
  ForkKnife,
  Wrench,
  Pill,
  TShirt,
  ShoppingCart,
  Scissors,
  DeviceMobile,
  Car,
  Books,
  HouseLine,
  MusicNote,
  DotsThreeCircle,
  Package,
} from "@phosphor-icons/react/dist/ssr";

const categoryIconMap: Record<string, any> = {
  comidas: ForkKnife,
  ferreterias: Wrench,
  salud: Pill,
  moda: TShirt,
  tiendas: ShoppingCart,
  belleza: Scissors,
  tecnologia: DeviceMobile,
  transporte: Car,
  educacion: Books,
  hogar: HouseLine,
  entretenimiento: MusicNote,
  otros: DotsThreeCircle,
};

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          businesses: { where: { isActive: true, status: "APPROVED" } },
        },
      },
    },
  });
}

async function getFeaturedBusinesses() {
  return prisma.business.findMany({
    where: { isActive: true, status: "APPROVED", isFeatured: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true, emoji: true } },
      images: { where: { isCover: true }, take: 1 },
      reviews: { select: { rating: true } },
    },
  });
}

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedBusinesses(),
  ]);

  return (
    <div className="px-4 pt-4 space-y-6">

      {/* Hero */}
      <div>
        <h2 className="text-3xl font-black text-foreground leading-tight">
          Descubre los negocios<br />
          <span className="text-accent">de Villa Rica</span>
        </h2>
        <p className="text-sm text-muted mt-1">
          Todo tu municipio en un solo lugar
        </p>
      </div>

      {/* Buscador */}
      <SearchBar />

      {/* Categorías */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">Categorías</h3>
          <span className="text-xs text-muted">{categories.length} categorías</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              icon={categoryIconMap[cat.slug] || Package}
              count={cat._count.businesses}
            />
          ))}
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">Destacados</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.map((biz) => {
              const ratings = biz.reviews.map((r) => r.rating);
              const avg = ratings.length
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : null;
              return (
                <BusinessCard
                  key={biz.id}
                  id={biz.id}
                  name={biz.name}
                  slug={biz.slug}
                  category={biz.category}
                  coverImage={biz.images[0]?.url}
                  avgRating={avg}
                  reviewCount={ratings.length}
                  address={biz.address}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Estado vacío destacados */}
      {featured.length === 0 && (
        <section>
          <h3 className="text-base font-bold text-foreground mb-3">
            Negocios recientes
          </h3>
          <div className="rounded-card bg-surface border border-border p-8 text-center">
            <span className="text-4xl">🏪</span>
            <p className="text-sm text-muted mt-2">
              Pronto habrá negocios aquí.<br />¡Sé el primero en registrarte!
            </p>
          </div>
        </section>
      )}

    </div>
  );
}
