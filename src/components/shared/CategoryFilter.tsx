"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { name: string; slug: string }[];
  active?: string;
  className?: string;
}

export function CategoryFilter({ categories, active, className }: CategoryFilterProps) {
  return (
    <div className={cn("w-full overflow-x-auto no-scrollbar", className)}>
      <div className="flex items-center gap-2 px-4 py-1">
        <Link
          href="/negocios"
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-pill text-sm font-medium transition-colors",
            !active
              ? "bg-accent text-white"
              : "bg-surface text-foreground border border-border"
          )}
        >
          Todas
        </Link>
        {categories.map((cat) => {
          const isActive = active === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/negocios?category=${cat.slug}`}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-pill text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "bg-surface text-foreground border border-border"
              )}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
