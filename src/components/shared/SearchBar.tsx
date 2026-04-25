"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Busca negocios, categorías..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/negocios?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("w-full", className)}>
      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          weight="regular"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-pill bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
      </div>
    </form>
  );
}
