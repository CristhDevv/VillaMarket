"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, PencilSimple, Trash, Package, Tag, 
  CheckCircle, XCircle, CaretDown, CaretUp, X
} from "@phosphor-icons/react";

interface Product {
  id: string; name: string; price: number; description?: string;
  available: boolean; image?: string;
  category?: { id: string; name: string } | null;
}

interface ProductCategory {
  id: string; name: string; _count: { products: number };
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [catSectionOpen, setCatSectionOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/dashboard/products").then(r => r.json()),
      fetch("/api/dashboard/product-categories").then(r => r.json()),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" });
    setProducts(p => p.filter(x => x.id !== id));
  };

  const handleToggleAvailable = async (product: Product) => {
    const res = await fetch(`/api/dashboard/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
    if (res.ok) setProducts(p => p.map(x => x.id === product.id ? { ...x, available: !x.available } : x));
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    const res = await fetch("/api/dashboard/product-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    if (res.ok) { await load(); setNewCatName(""); }
    setCatLoading(false);
  };

  const handleDeleteCategory = async (id: string, name: string, count: number) => {
    const msg = count > 0
      ? `¿Eliminar la categoría "${name}"? Los ${count} productos quedarán sin categoría.`
      : `¿Eliminar la categoría "${name}"?`;
    if (!confirm(msg)) return;
    await fetch(`/api/dashboard/product-categories?id=${id}`, { method: "DELETE" });
    await load();
  };

  const filtered = activeFilter ? products.filter(p => p.category?.id === activeFilter) : products;

  if (loading) return <div className="text-center py-20 text-muted text-sm">Cargando productos...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Productos</h1>
          <p className="text-sm text-muted mt-0.5">{products.length} productos registrados</p>
        </div>
        <Link href="/dashboard/productos/nuevo"
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-pill text-sm font-bold active:scale-95 transition-all">
          <Plus size={16} weight="bold" /> Agregar
        </Link>
      </div>

      {/* Filtro por categoría propia */}
      {categories.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1">
            <button onClick={() => setActiveFilter(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${!activeFilter ? "bg-accent text-white" : "bg-surface text-foreground border border-border"}`}>
              Todos
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${activeFilter === cat.id ? "bg-accent text-white" : "bg-surface text-foreground border border-border"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de productos */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-card bg-surface">
          <Package size={40} className="mx-auto text-muted mb-3" weight="light" />
          <p className="text-sm font-medium text-foreground">No hay productos aún</p>
          <p className="text-xs text-muted mt-1">Agrega tu primer producto para comenzar</p>
          <Link href="/dashboard/productos/nuevo"
            className="mt-4 inline-block px-6 py-2 bg-accent text-white rounded-pill text-sm font-bold">
            Agregar producto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => (
            <div key={product.id} className="bg-white border border-border rounded-card p-4 flex items-center gap-4">
              {/* Imagen/Placeholder */}
              <div className="w-16 h-16 rounded-card bg-surface border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-muted" weight="light" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-foreground line-clamp-1">{product.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill flex-shrink-0 ${product.available ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                    {product.available ? "Disponible" : "Agotado"}
                  </span>
                </div>
                <p className="text-accent font-black text-sm mt-0.5">
                  ${Number(product.price).toLocaleString("es-CO")}
                </p>
                {product.category && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag size={10} className="text-muted" />
                    <span className="text-[10px] text-muted">{product.category.name}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleToggleAvailable(product)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-border hover:bg-border transition-colors"
                  title={product.available ? "Marcar agotado" : "Marcar disponible"}>
                  {product.available
                    ? <CheckCircle size={16} className="text-green-600" weight="fill" />
                    : <XCircle size={16} className="text-red-500" weight="fill" />
                  }
                </button>
                <Link href={`/dashboard/productos/${product.id}/editar`}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-border hover:bg-border transition-colors">
                  <PencilSimple size={14} className="text-foreground" />
                </Link>
                <button onClick={() => handleDelete(product.id, product.name)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                  <Trash size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gestión de categorías propias (colapsable) */}
      <div className="bg-white border border-border rounded-card overflow-hidden">
        <button
          onClick={() => setCatSectionOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-accent" />
            Categorías propias ({categories.length})
          </div>
          {catSectionOpen ? <CaretUp size={16} className="text-muted" /> : <CaretDown size={16} className="text-muted" />}
        </button>

        {catSectionOpen && (
          <div className="border-t border-border p-4 space-y-3">
            {/* Agregar categoría */}
            <div className="flex gap-2">
              <input
                type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                placeholder="Nombre de categoría..."
                className="flex-1 h-10 px-3 rounded-card bg-surface border border-border text-sm focus:outline-none focus:border-accent"
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
              />
              <button onClick={handleAddCategory} disabled={catLoading || !newCatName.trim()}
                className="h-10 px-4 bg-accent text-white text-xs font-bold rounded-card disabled:opacity-50">
                {catLoading ? "..." : "Agregar"}
              </button>
            </div>

            {/* Lista de categorías */}
            {categories.length === 0 ? (
              <p className="text-xs text-muted text-center py-2">No tienes categorías propias aún</p>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between bg-surface rounded-card px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{cat._count.products} productos</span>
                      <button onClick={() => handleDeleteCategory(cat.id, cat.name, cat._count.products)}
                        className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
