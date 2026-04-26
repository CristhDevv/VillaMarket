"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, CheckCircle, SpinnerGap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Busca negocios, categorías..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length <= 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/businesses?search=${encodeURIComponent(query.trim())}&limit=5`);
        const data = await res.json();
        if (data.data?.businesses) {
          setResults(data.data.businesses);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Error al buscar", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/negocios?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("w-full relative z-50", className)}>
      <form onSubmit={handleSearch}>
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
            onFocus={() => { if (query.trim().length > 2) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full h-12 pl-11 pr-10 rounded-pill bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
          {loading && (
            <SpinnerGap size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted animate-spin" />
          )}
        </div>
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="divide-y divide-border">
            {results.map((biz) => (
              <li key={biz.id}>
                <Link
                  href={`/negocios/${biz.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-3 hover:bg-surface transition-colors"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-foreground">{biz.name}</span>
                      {biz.isVerified && (
                        <span title="Verificado">
                          <CheckCircle size={14} weight="fill" className="text-accent" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted mt-0.5">
                      {biz.category.emoji} {biz.category.name}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div 
            onClick={handleSearch}
            className="p-3 bg-surface text-center text-xs font-bold text-accent cursor-pointer hover:bg-accent/5 transition-colors"
          >
            Ver todos los resultados
          </div>
        </div>
      )}

      {isOpen && !loading && results.length === 0 && query.trim().length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-card shadow-lg p-4 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-muted">No se encontraron negocios</p>
        </div>
      )}
    </div>
  );
}
