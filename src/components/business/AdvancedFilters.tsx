"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Funnel, X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function AdvancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local state to hold filter values
  const [openNow, setOpenNow] = useState(false);
  const [verified, setVerified] = useState(false);
  const [priceRange, setPriceRange] = useState("");

  useEffect(() => {
    setOpenNow(searchParams.get("open") === "true");
    setVerified(searchParams.get("verified") === "true");
    setPriceRange(searchParams.get("priceRange") || "");
  }, [searchParams]);

  const activeFiltersCount = (openNow ? 1 : 0) + (verified ? 1 : 0) + (priceRange ? 1 : 0);

  const applyFilters = (updates: { open?: boolean; verified?: boolean; priceRange?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.open !== undefined) {
      if (updates.open) params.set("open", "true");
      else params.delete("open");
    }
    
    if (updates.verified !== undefined) {
      if (updates.verified) params.set("verified", "true");
      else params.delete("verified");
    }
    
    if (updates.priceRange !== undefined) {
      if (updates.priceRange) params.set("priceRange", updates.priceRange);
      else params.delete("priceRange");
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/negocios?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("open");
    params.delete("verified");
    params.delete("priceRange");
    params.delete("page");
    router.push(`/negocios?${params.toString()}`);
  };

  return (
    <div className="px-4 mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-foreground bg-surface border border-border px-4 py-2 rounded-pill hover:border-accent transition-colors"
      >
        <Funnel size={16} />
        Filtros avanzados
        {activeFiltersCount > 0 && (
          <span className="bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-white border border-border rounded-card shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-sm text-foreground">Filtros</h3>
            {activeFiltersCount > 0 && (
              <button 
                onClick={handleClear}
                className="text-xs font-medium text-muted hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X size={12} /> Limpiar todo
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Toggle Abierto Ahora */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Abierto ahora</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={openNow}
                  onChange={(e) => applyFilters({ open: e.target.checked })}
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
              </div>
            </label>

            {/* Toggle Solo Verificados */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Solo verificados</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={verified}
                  onChange={(e) => applyFilters({ verified: e.target.checked })}
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
              </div>
            </label>

            {/* Rango de precio */}
            <div className="pt-1">
              <span className="text-sm font-medium text-foreground block mb-2">Rango de precio (promedio)</span>
              <select 
                value={priceRange}
                onChange={(e) => applyFilters({ priceRange: e.target.value })}
                className="w-full h-10 px-3 rounded-card bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-accent"
              >
                <option value="">Todos los precios</option>
                <option value="low">Económico (&lt; $20.000)</option>
                <option value="medium">Medio ($20.000 - $80.000)</option>
                <option value="high">Premium (&gt; $80.000)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
