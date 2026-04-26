import { BusinessCard } from "./BusinessCard";

interface Business {
  id: string;
  name: string;
  slug: string;
  category: { name: string; emoji: string };
  coverImage?: string;
  avgRating?: number | null;
  reviewCount?: number;
  whatsapp?: string | null;
  address?: string | null;
}

interface BusinessGridProps {
  businesses: Business[];
  emptyMessage?: string;
}

export function BusinessGrid({
  businesses,
  emptyMessage = "No se encontraron negocios",
}: BusinessGridProps) {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {businesses.map((business) => (
        <BusinessCard key={business.id} {...business} />
      ))}
    </div>
  );
}
