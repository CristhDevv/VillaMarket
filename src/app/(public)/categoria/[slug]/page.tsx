import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Storefront } from "@phosphor-icons/react/dist/ssr";
import { getBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/business/BusinessCard";
import { categoryThemes } from "@/lib/category-themes";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/shared/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) return {};
  
  const title = `Negocios de ${category.name} en Villa Rica`;
  const description = `Encuentra los mejores negocios locales en la categoría de ${category.name} en VillaMarket, Villa Rica, Cauca.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const theme = categoryThemes[slug] || categoryThemes['otros'];

  // Fetch businesses for this category
  const { businesses, total } = await getBusinesses({ category: slug, limit: 50 });

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Negocios de ${category.name} en Villa Rica`,
        itemListElement: businesses.map((b: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          url: `https://villamarket.co/negocios/${b.slug}`,
        })),
      }} />
      {/* Category Header */}
      <div className={cn("w-full py-12 px-6 bg-gradient-to-br relative overflow-hidden", theme.gradient)}>
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-start mb-6">
            <Link href="/negocios" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors drop-shadow-sm">
              <ArrowLeft size={16} /> Volver al directorio
            </Link>
          </div>
          
          <div className="text-6xl mb-4 drop-shadow-lg">{theme.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-md">
            {category.name}
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mx-auto drop-shadow-sm">
            {theme.description}
          </p>
          <div className="mt-6 inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold shadow-sm">
            {total === 1 ? "1 negocio" : `${total} negocios`} disponibles
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {businesses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {businesses.map((biz: any) => {
                const ratings = biz.reviews.map((r: any) => r.rating);
                const avg = ratings.length
                  ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
                  : null;
                return (
                  <BusinessCard
                    key={biz.id}
                    id={biz.id}
                    name={biz.name}
                    slug={biz.slug}
                    category={biz.category}
                    coverImage={biz.images.find((img: any) => img.isCover)?.url ?? biz.images[0]?.url}
                    avgRating={avg}
                    reviewCount={ratings.length}
                    address={biz.address}
                    isVerified={biz.isVerified}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-surface rounded-2xl border border-border">
              <div className="text-6xl mb-4 opacity-50 grayscale">{theme.emoji}</div>
              <h3 className="text-xl font-bold text-foreground">Aún no hay negocios aquí</h3>
              <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
                Sé el primero en registrar un negocio de {category.name.toLowerCase()} en VillaMarket y aprovecha {theme.description.toLowerCase()}.
              </p>
              <Link
                href="/dashboard/negocio"
                className="mt-8 inline-block px-8 py-3 bg-accent text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Registrar mi negocio
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
