import { prisma } from "@/lib/prisma";
import AllBusinessesMapWrapper from "@/components/map/AllBusinessesMapWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa de negocios — VillaMarket",
  description:
    "Encuentra todos los negocios de Villa Rica, Cauca en el mapa. Explora tiendas, restaurantes y más.",
};

async function getBusinessesWithCoords() {
  return prisma.business.findMany({
    where: {
      isActive: true,
      status: "APPROVED",
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      latitude: true,
      longitude: true,
      address: true,
      category: {
        select: { name: true, emoji: true, slug: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function MapaPage() {
  const raw = await getBusinessesWithCoords();

  // latitude/longitude son Float? en el schema — el where garantiza que no son null,
  // pero TypeScript no lo infiere, así que hacemos el cast aquí.
  const businesses = raw.map((b) => ({
    ...b,
    latitude: b.latitude as number,
    longitude: b.longitude as number,
  }));

  return (
    // h-[calc(100dvh-4rem)] → full viewport height menos el BottomNav (h-16 = 4rem)
    <div className="fixed inset-0 bottom-16" style={{ zIndex: 0 }}>
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
          <span className="text-5xl">🗺️</span>
          <h1 className="text-xl font-bold text-foreground">
            Aún no hay negocios en el mapa
          </h1>
          <p className="text-sm text-muted max-w-xs">
            Los negocios aparecerán aquí una vez que agreguen su ubicación.
          </p>
        </div>
      ) : (
        <AllBusinessesMapWrapper businesses={businesses} />
      )}
    </div>
  );
}
