"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface ProductCategory { id: string; name: string; }

const inputClass = "w-full h-12 px-4 rounded-card bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm";
const labelClass = "block text-sm font-semibold text-foreground mb-1";

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = !!productId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  const [form, setForm] = useState({
    name: "", price: "", description: "", image: "",
    categoryId: "", available: true,
  });

  useEffect(() => {
    fetch("/api/dashboard/product-categories").then(r => r.json()).then(res => setCategories(res.data || []));
    if (isEdit) {
      fetch("/api/dashboard/products").then(r => r.json()).then(res => {
        const p = (res.data || []).find((x: any) => x.id === productId);
        if (p) setForm({
          name: p.name, price: String(p.price), description: p.description || "",
          image: p.image || "", categoryId: p.category?.id || "", available: p.available,
        });
        setFetching(false);
      });
    }
  }, [isEdit, productId]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await fetch("/api/dashboard/product-categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCategories(c => [...c, data.data]);
      setForm(f => ({ ...f, categoryId: data.data.id }));
      setNewCatName(""); setShowNewCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const price = parseFloat(form.price);
    if (!form.name || isNaN(price) || price <= 0) {
      setError("Nombre y precio válido son obligatorios"); setLoading(false); return;
    }

    const body = {
      name: form.name, price, description: form.description || null,
      image: form.image || null, categoryId: form.categoryId || null, available: form.available,
    };

    const url = isEdit ? `/api/dashboard/products/${productId}` : "/api/dashboard/products";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar el producto");
    } else {
      router.push("/dashboard/productos");
    }
    setLoading(false);
  };

  if (fetching) return <div className="text-center py-20 text-muted text-sm">Cargando...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-foreground">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-card text-sm font-medium">{error}</div>}

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input type="text" value={form.name} onChange={set("name")} required className={inputClass} placeholder="Ej: Almuerzo corriente" />
          </div>

          <div>
            <label className={labelClass}>Precio (COP) *</label>
            <input type="number" value={form.price} onChange={set("price")} required min="0" step="100" className={inputClass} placeholder="Ej: 8000" />
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              className="w-full px-4 py-3 rounded-card bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none"
              placeholder="Describe el producto..." />
          </div>

          <div>
            <label className={labelClass}>Imagen del producto</label>
            <ImageUpload 
              value={form.image} 
              onChange={(url) => setForm(f => ({ ...f, image: url }))} 
              folder="products" 
              aspectRatio="square" 
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass.replace("mb-1", "")}>Categoría propia</label>
              <button type="button" onClick={() => setShowNewCat(v => !v)}
                className="text-xs text-accent font-medium">+ Nueva</button>
            </div>

            {showNewCat && (
              <div className="flex gap-2 mb-2">
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="Nombre de la categoría" className="flex-1 h-10 px-3 rounded-card bg-surface border border-border text-sm focus:outline-none focus:border-accent" />
                <button type="button" onClick={handleAddCategory}
                  className="h-10 px-3 bg-accent text-white text-xs font-bold rounded-card">Agregar</button>
              </div>
            )}

            <select value={form.categoryId} onChange={set("categoryId")} className={inputClass}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-foreground">Disponibilidad</p>
              <p className="text-xs text-muted">{form.available ? "Disponible para pedidos" : "No disponible (agotado)"}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, available: !f.available }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? "bg-accent" : "bg-border"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.available ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 h-12 bg-surface text-foreground border border-border font-medium rounded-pill text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-12 bg-accent text-white font-bold rounded-pill disabled:opacity-70 active:scale-95 transition-all text-sm">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
