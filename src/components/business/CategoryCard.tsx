import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Icon } from "@phosphor-icons/react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: Icon;
  count?: number;
  className?: string;
}

export function CategoryCard({ name, slug, icon: IconComponent, count, className }: CategoryCardProps) {
  return (
    <Link href={`/categoria/${slug}`}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-4 rounded-card bg-surface border border-border shadow-card active:scale-95 transition-all duration-150 cursor-pointer hover:bg-surface/80 hover:border-accent/30 hover:shadow-modal",
          className
        )}
      >
        <IconComponent size={32} weight="regular" className="text-accent" />
        <span className="text-xs font-semibold text-foreground text-center leading-tight line-clamp-2">
          {name}
        </span>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] text-muted">{count} negocios</span>
        )}
      </div>
    </Link>
  );
}
