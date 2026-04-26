import Link from "next/link";
import Image from "next/image";
import { Star, WhatsappLogo, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  id: string;
  name: string;
  slug: string;
  category: { name: string; emoji: string };
  coverImage?: string;
  avgRating?: number | null;
  reviewCount?: number;
  whatsapp?: string | null;
  address?: string | null;
  isVerified?: boolean;
  className?: string;
}

export function BusinessCard({
  name,
  slug,
  category,
  coverImage,
  avgRating,
  reviewCount,
  whatsapp,
  address,
  isVerified,
  className,
}: BusinessCardProps) {
  return (
    <Link href={`/negocios/${slug}`}>
      <div
        className={cn(
          "rounded-card bg-white border border-border shadow-card overflow-hidden active:scale-95 transition-all duration-150",
          className
        )}
      >
        {/* Imagen */}
        <div className="relative w-full h-40 bg-surface">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">{category.emoji}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Categoría pill */}
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/8 px-2 py-0.5 rounded-pill mb-1">
            {category.emoji} {category.name}
          </span>

          {/* Nombre */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">
              {name}
            </h3>
            {isVerified && (
              <div className="flex-shrink-0 flex items-center gap-0.5 text-accent bg-accent/10 px-1.5 py-0.5 rounded-pill" title="Negocio Verificado">
                <CheckCircle size={10} weight="fill" />
                <span className="text-[9px] font-bold">Verificado</span>
              </div>
            )}
          </div>

          {/* Dirección */}
          {address && (
            <p className="text-[11px] text-muted line-clamp-1 mb-2">{address}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            {avgRating ? (
              <div className="flex items-center gap-1">
                <Star size={12} weight="fill" className="text-yellow-400" />
                <span className="text-xs font-medium text-foreground">
                  {avgRating.toFixed(1)}
                </span>
                {reviewCount !== undefined && (
                  <span className="text-[10px] text-muted">({reviewCount})</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-muted">Sin reseñas aún</span>
            )}

            {/* WhatsApp */}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-pill"
              >
                <WhatsappLogo size={12} weight="fill" />
                Chat
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
