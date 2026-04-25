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
  const image = business.coverImage || (business.images.length > 0 ? business.images[0].url : undefined);

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

  const ratings = business.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
    : null;

  const allProducts = business.products;
  const productCategories = business.productCategories;

  return (
    <div className="pb-8">
      {/* 1. Galería / Banner */}
      <div className="w-full h-64 bg-surface relative overflow-hidden flex items-center justify-center">
        {business.coverImage ? (
          <Image src={business.coverImage} alt={business.name} fill className="object-cover" priority />
        ) : business.images.length > 0 ? (
          <Image src={business.images[0].url} alt={business.name} fill className="object-cover" priority />
        ) : (
          <span className="text-6xl">{business.category.emoji}</span>
        )}
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
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-pill">
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

        {/* 4. Sobre el negocio */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Sobre el negocio</h2>
          {business.description && <p className="text-sm text-muted leading-relaxed">{business.description}</p>}
          {business.address && (
            <div className="flex items-start gap-2 bg-surface p-3 rounded-card border border-border mt-3">
              <MapPin size={20} className="text-accent flex-shrink-0 mt-0.5" weight="fill" />
              <div>
                <p className="text-sm font-medium text-foreground">{business.address}</p>
                {business.latitude && business.longitude && (
                  <a href={`https://maps.google.com/?q=${business.latitude},${business.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-accent hover:underline mt-1 inline-block">
                    Ver en Google Maps
                  </a>
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
                <div key={product.id} className="bg-white border border-border rounded-card overflow-hidden shadow-sm">
                  {/* Imagen */}
                  <div className="relative w-full h-28 bg-surface flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    ) : (
                      <Package size={32} className="text-muted" weight="light" />
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
                      available={product.available}
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
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Reseñas</h2>
          {business.reviews.length > 0 ? (
            <div className="space-y-3">
              {business.reviews.map(review => (
                <div key={review.id} className="bg-surface border border-border rounded-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center font-bold text-xs text-muted overflow-hidden">
                      {review.user.image
                        ? <Image src={review.user.image} alt={review.user.name || "User"} width={32} height={32} />
                        : (review.user.name || "U")[0].toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{review.user.name || "Usuario anónimo"}</p>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} weight={i < review.rating ? "fill" : "regular"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-xs text-muted leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-card p-6 text-center">
              <Star size={32} className="mx-auto text-muted mb-2" weight="light" />
              <p className="text-sm font-medium text-foreground">Aún no hay reseñas</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
