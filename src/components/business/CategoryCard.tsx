import Link from "next/link";
import { cn } from "@/lib/utils";
import { categoryThemes } from "@/lib/category-themes";

interface CategoryCardProps {
  name: string;
  slug: string;
  count?: number;
  className?: string;
  icon?: any; // kept for backwards compatibility but we'll use theme emoji
}

export function CategoryCard({ name, slug, count, className }: CategoryCardProps) {
  const theme = categoryThemes[slug] || categoryThemes['otros'];

  return (
    <Link href={`/categoria/${slug}`}>
      <div
        className={cn(
          "relative overflow-hidden flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
          "hover:scale-[1.02] hover:shadow-md",
          className
        )}
        style={{
          backgroundColor: theme.bgColor,
          borderColor: theme.borderColor,
        }}
      >
        {/* Subtle decorative gradient top right */}
        <div 
          className={cn(
            "absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-40 bg-gradient-to-br",
            theme.gradient
          )} 
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <span className="text-3xl" aria-hidden="true">{theme.emoji}</span>
            {count !== undefined && count > 0 && (
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ 
                  color: theme.iconColor, 
                  backgroundColor: `${theme.iconColor}15` 
                }}
              >
                {count} {count === 1 ? 'negocio' : 'negocios'}
              </span>
            )}
          </div>
          
          <h3 className="text-[#1D1D1F] font-semibold text-sm leading-tight font-poppins mb-1">
            {name}
          </h3>
          <p className="text-[#6E6E73] text-[10px] leading-snug">
            {theme.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
