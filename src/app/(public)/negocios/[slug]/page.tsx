import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ActionButtons } from "@/components/business/ActionButtons";
import { ShareButton } from "@/components/business/ShareButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { 
  Star, MapPin, InstagramLogo, FacebookLogo, Globe, 
  CheckCircle, Package 
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { ReviewForm } from "@/components/business/ReviewForm";
import { ReviewList } from "@/components/business/ReviewList";
import { JsonLd } from "@/components/shared/JsonLd";
import dynamic from "next/dynamic";

const BusinessMap = dynamic(
  () => import("@/components/map/BusinessMap"),
  { ssr: false }
);

interface ProductWithStock {
  id: string;
  name: string;
  price: { toNumber: () => number } | number;
  image: string | null;
  available: boolean;
  stock: number | null;
  category: { id: string; name: string } | null;
}

async function getBusiness(slug: string) {
  return prisma.business.findUnique({
    where: { slug, isActive: true, status: "APPROVED" },
    include: {
      category: { select: { name: true, emoji: true, slug: true } },
      images: { orderBy: { order: "asc" } },
      reviews: { 
        orderBy: { createdAt: "desc" }, take: 5,
        include: { user: { select: { name: true, image: true } } }
      },
      products: {
        where: { available: true },
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      productCategories: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) return {};
  
  const title = `${business.name} — VillaMarket`;
  const description = business.description || `Encuentra ${business.name} en Villa Rica, Cauca`;
  const image = business.coverImage || business.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [{ url: image }] : [],
    }
  };
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();

  const session = await auth();
  let existingReview = null;
  if (session?.user?.id) {
    existingReview = await prisma.review.findUnique({
      where: { businessId_userId: { businessId: business.id, userId: session.user.id } },
    });
  }

  const ratings = business.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
    : null;

  const allProducts = business.products as unknown as ProductWithStock[];
  const productCategories = business.productCategories;

  // — JSON-LD helpers —
  // openingHours in Schema.org format: "Mo 08:00-18:00"
  const dayAbbr: Record<string, string> = {
    lunes: "Mo", martes: "Tu", miercoles: "We", jueves: "Th",
    viernes: "Fr", sabado: "Sa", domingo: "Su",
  };
  const openingHours: string[] = [];
  if (business.schedule) {
    const sched = business.schedule as Record<string, { open: string; close: string }>;
    for (const [day, hours] of Object.entries(sched)) {
      const abbr = dayAbbr[day.toLowerCase()];
      if (abbr) openingHours.push(`${abbr} ${hours.open}-${hours.close}`);
    }
  }

  const productPrices = business.products.map(p => Number(p.price));
  const avgPrice = productPrices.length
    ? productPrices.reduce((a, b) => a + b, 0) / productPrices.length
    : null;
  const priceRange = avgPrice === null ? undefined
    : avgPrice < 20000 ? "$"
    : avgPrice <= 80000 ? "$$"
    : "$$$";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description || undefined,
    image: business.coverImage || undefined,
    telephone: business.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || undefined,
      addressLocality: "Villa Rica",
      addressRegion: "Cauca",
      addressCountry: "CO",
    },
    url: `https://villamarket.co/negocios/${business.slug}`,
    ...(openingHours.length && { openingHours }),
    ...(priceRange && { priceRange }),
    ...(avgRating && { aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: ratings.length,
    }}),
  };

  return (
    <div className="pb-8">
      <JsonLd data={localBusinessSchema} />
      {/* 1. Galería / Banner */}
      <div className="w-full h-64 bg-surface relative overflow-hidden flex items-center justify-center">
        {(() => {
          const cover = business.coverImage || business.images?.[0]?.url;
          return cover ? (
            <Image src={cover} alt={business.name} fill className="object-cover" priority />
          ) : (
            <span className="text-6xl">{business.category.emoji}</span>
          );
        })()}
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* 2. Header */}
        <div>
          <div className="flex justify-between items-start">
            <Link href={`/negocios?category=${business.category.slug}`}>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/8 px-2.5 py-1 rounded-pill mb-2">
                {business.category.emoji} {business.category.name}
              </span>
            </Link>
            <ShareButton 
              title={`${business.name} en VillaMarket`} 
              text={business.description || `Encuentra ${business.name} en Villa Rica`}
              url={`https://villamarket.co/negocios/${business.slug}`}
            />
          </div>
          <h1 className="text-2xl font-black text-foreground leading-tight mt-1">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {avgRating ? (
              <div className="flex items-center gap-1">
                <Star size={16} weight="fill" className="text-yellow-400" />
                <span className="text-sm font-bold text-foreground">{avgRating}</span>
                <span className="text-xs text-muted">({ratings.length} reseñas)</span>
              </div>
            ) : <span className="text-xs text-muted">Sin reseñas aún</span>}
            {business.isVerified && (
              <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-0.5 rounded-pill">
                <CheckCircle size={12} weight="fill" />
                <span className="text-[10px] font-bold">Verificado</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Botones de acción */}
        {(business.phone || business.whatsapp) && (
          <ActionButtons name={business.name} phone={business.phone} whatsapp={business.whatsapp} />
        )}

        {/* 4. Galería pública */}
        {business.images && business.images.length > 0 && (
          <section className="space-y-3 -mx-4 px-4 overflow-hidden md:mx-0 md:px-0">
            <h2 className="text-lg font-bold text-foreground">Galería</h2>
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 md:grid md:grid-cols-3 md:overflow-visible">
              {business.images.map((img) => (
                <div key={img.id} className="relative w-40 h-40 md:w-full md:h-48 flex-shrink-0 rounded-card overflow-hidden bg-surface border border-border">
                  <Image src={img.url} alt="Foto del negocio" fill className="object-cover" sizes="(max-width: 768px) 160px, 33vw" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Sobre el negocio */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Sobre el negocio</h2>
          {business.description && <p className="text-sm text-muted leading-relaxed">{business.description}</p>}
          {business.address && (
            <div className="flex items-start gap-2 bg-surface p-3 rounded-card border border-border mt-3">
              <MapPin size={20} className="text-accent flex-shrink-0 mt-0.5" weight="fill" />
              <div>
                <p className="text-sm font-medium text-foreground">{business.address}</p>
                {business.latitude && business.longitude && (
                  <div className="mt-4">
                    <BusinessMap
                      latitude={business.latitude}
                      longitude={business.longitude}
                      businessName={business.name}
                      address={business.address}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 5. Productos — nueva sección */}
        {allProducts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Menú / Productos</h2>

            {/* Filtros por categoría propia */}
            {productCategories.length > 0 && (
              <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
                <div className="flex gap-2 pb-1">
                  {productCategories.map(cat => (
                    <span key={cat.id}
                      className="flex-shrink-0 text-xs font-medium text-muted bg-surface border border-border px-3 py-1.5 rounded-pill">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {allProducts.map(product => (
                <div key={product.id} className={`bg-white border border-border rounded-card overflow-hidden shadow-sm ${product.stock === 0 ? 'opacity-75' : ''}`}>
                  {/* Imagen */}
                  <div className="relative w-full h-28 bg-surface flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    ) : (
                      <Package size={32} className="text-muted" weight="light" />
                    )}
                    {/* Stock badge overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-pill">Agotado</span>
                      </div>
                    )}
                    {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-pill shadow">
                          Solo quedan {product.stock}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{product.name}</p>
                    <p className="text-accent font-black text-sm mt-1">
                      ${Number(product.price).toLocaleString("es-CO")}
                    </p>
                    <AddToCartButton
                      productId={product.id}
                      name={product.name}
                      price={Number(product.price)}
                      businessId={business.id}
                      businessName={business.name}
                      businessSlug={business.slug}
                      available={product.available && product.stock !== 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Horario */}
        {business.schedule && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Horario</h2>
            <div className="bg-surface rounded-card border border-border p-4 space-y-2">
              {Object.entries(business.schedule as Record<string, { open: string; close: string }>).map(([day, hours]) => {
                const todayNumber = new Date().getDay();
                const dayMap: Record<number, string> = { 0: "domingo", 1: "lunes", 2: "martes", 3: "miercoles", 4: "jueves", 5: "viernes", 6: "sabado" };
                const isToday = dayMap[todayNumber] === day.toLowerCase().replace("é", "e");
                return (
                  <div key={day} className={`flex justify-between text-sm ${isToday ? "font-bold text-accent" : "text-foreground"}`}>
                    <span className="capitalize">{day}</span>
                    <span>{hours.open} - {hours.close}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Redes sociales */}
        {(business.instagram || business.facebook || business.website) && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Redes y contacto</h2>
            <div className="flex gap-2">
              {business.instagram && (
                <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full border border-border hover:bg-accent hover:text-white transition-colors">
                  <InstagramLogo size={20} />
                </a>
              )}
              {business.facebook && (
                <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full border border-border hover:bg-accent hover:text-white transition-colors">
                  <FacebookLogo size={20} />
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full border border-border hover:bg-accent hover:text-white transition-colors">
                  <Globe size={20} />
                </a>
              )}
            </div>
          </section>
        )}

        {/* 8. Reseñas */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Reseñas</h2>
          
          <ReviewForm 
            businessSlug={business.slug} 
            existingReview={existingReview ? {
              id: existingReview.id,
              rating: existingReview.rating,
              comment: existingReview.comment
            } : null}
          />

          <ReviewList businessSlug={business.slug} />
        </section>
      </div>
    </div>
  );
}
