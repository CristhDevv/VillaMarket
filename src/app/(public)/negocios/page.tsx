import { getBusinesses } from "@/lib/businesses";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/shared/SearchBar";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { BusinessCard } from "@/components/business/BusinessCard";
import { Storefront, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default async function NegociosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = parseInt(params.page || "1");

  const [categories, { businesses, total, totalPages }] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
    getBusinesses({ search, category, page, limit: 10 }),
  ]);

  return (
    <div className="pt-6 space-y-4">
      {/* Buscador */}
      <div className="px-4">
        <SearchBar placeholder="Busca por nombre, descripción..." />
      </div>

      {/* Chip de búsqueda activa */}
      {search && (
        <div className="px-4">
          <div className="inline-flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-pill text-sm">
            <span className="text-muted">Buscando:</span>
            <span className="font-semibold text-foreground">"{search}"</span>
            <Link href={`/negocios${category ? `?category=${category}` : ""}`}>
              <X size={14} className="text-muted hover:text-foreground" />
            </Link>
          </div>
        </div>
      )}

      {/* Filtro de categorías (scroll horizontal) */}
      <CategoryFilter categories={categories} active={category} />

      {/* Contenido principal */}
      <div className="px-4 pb-8">
        <p className="text-sm text-muted mb-4">
          {total === 1 ? "1 negocio encontrado" : `${total} negocios encontrados`}
        </p>

        {businesses.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {businesses.map((biz) => {
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
                    coverImage={biz.images.find(img => img.isCover)?.url ?? biz.images[0]?.url}
                    avgRating={avg}
                    reviewCount={ratings.length}
                    address={biz.address}
                  />
                );
              })}
            </div>

            {/* Paginación simple */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                {page > 1 ? (
                  <Link
                    href={`/negocios?page=${page - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                    className="px-4 py-2 bg-surface text-foreground font-medium rounded-pill border border-border text-sm"
                  >
                    Anterior
                  </Link>
                ) : (
                  <div />
                )}
                
                <span className="text-xs text-muted">
                  Página {page} de {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/negocios?page=${page + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                    className="px-4 py-2 bg-accent text-white font-medium rounded-pill text-sm"
                  >
                    Siguiente
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </>
        ) : (
          /* Estado vacío */
          <div className="text-center py-12 px-4">
            <Storefront size={48} className="mx-auto text-muted mb-4" weight="light" />
            <h3 className="text-lg font-bold text-foreground">
              {search || category ? "No encontramos resultados" : "Aún no hay negocios"}
            </h3>
            <p className="text-sm text-muted mt-2 max-w-[250px] mx-auto">
              {search || category 
                ? "Intenta con otros términos de búsqueda o selecciona otra categoría." 
                : "Aún no hay negocios registrados. ¡Pronto habrá más!"}
            </p>
            {(search || category) && (
              <Link
                href="/negocios"
                className="mt-6 inline-block px-6 py-2 bg-accent text-white rounded-pill text-sm font-medium"
              >
                Ver todos
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
