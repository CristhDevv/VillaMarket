"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MagnifyingGlass, CheckCircle, XCircle, ArrowSquareOut, Trash, Storefront } from "@phosphor-icons/react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  category: { name: string; emoji: string };
  owner: { name: string; email: string };
}

export default function AdminNegociosPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; input: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let url = "/api/admin/businesses?";
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (filterActive !== "ALL") url += `active=${filterActive === "TRUE"}&`;
    
    const res = await fetch(url).then(r => r.json());
    setBusinesses(res.data || []);
    setLoading(false);
  }, [search, filterActive]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isActive: !current } : b));
    const res = await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (!res.ok) {
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isActive: current } : b));
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isVerified: !current } : b));
    const res = await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    });
    if (!res.ok) {
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isVerified: current } : b));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || deleteConfirm.input !== deleteConfirm.name) return;
    
    const res = await fetch(`/api/admin/businesses/${deleteConfirm.id}`, { method: "DELETE" });
    if (res.ok) {
      setBusinesses(prev => prev.filter(b => b.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Gestión de Negocios</h1>
        <p className="text-sm text-muted mt-0.5">{businesses.length} negocios encontrados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-card bg-white border border-border text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="h-11 px-4 rounded-card bg-white border border-border text-sm focus:outline-none focus:border-accent"
        >
          <option value="ALL">Todos los estados</option>
          <option value="TRUE">Solo Activos (Aprobados)</option>
          <option value="FALSE">Solo Inactivos (En revisión)</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">Cargando negocios...</div>
        ) : businesses.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            <Storefront size={40} className="mx-auto mb-3 opacity-20" />
            No se encontraron negocios
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Negocio</th>
                  <th className="px-4 py-3">Dueño</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <span className="text-base">{business.category.emoji}</span>
                        {business.name}
                      </p>
                      <p className="text-[10px] text-muted">{business.category.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{business.owner.name || "Sin nombre"}</p>
                      <p className="text-[10px] text-muted">{business.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {format(new Date(business.createdAt), "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 items-start">
                        <button
                          onClick={() => toggleActive(business.id, business.isActive)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold transition-all ${
                            business.isActive 
                              ? "bg-green-50 text-green-700 hover:bg-green-100" 
                              : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          }`}
                        >
                          {business.isActive ? (
                            <><CheckCircle size={12} weight="fill" /> Activo</>
                          ) : (
                            <><XCircle size={12} weight="fill" /> Inactivo</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => toggleVerified(business.id, business.isVerified)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold transition-all ${
                            business.isVerified 
                              ? "bg-accent/10 text-accent hover:bg-accent/20" 
                              : "bg-surface text-muted border border-border hover:bg-border/50"
                          }`}
                        >
                          {business.isVerified ? (
                            <><CheckCircle size={12} weight="fill" /> ✓ Verificado</>
                          ) : (
                            <><CheckCircle size={12} /> Verificar</>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/negocios/${business.slug}`}
                          target="_blank"
                          className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors text-foreground"
                          title="Ver en directorio"
                        >
                          <ArrowSquareOut size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm({ id: business.id, name: business.name, input: "" })}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-red-600 flex items-center gap-2">
              <Trash size={20} /> Eliminar negocio
            </h3>
            <p className="text-sm text-foreground">
              Esta acción es <strong>irreversible</strong>. Se eliminará el negocio, sus productos y sus pedidos.
            </p>
            <div className="bg-surface p-3 rounded text-sm text-muted">
              Para confirmar, escribe: <strong className="text-foreground select-all">{deleteConfirm.name}</strong>
            </div>
            <input
              type="text"
              value={deleteConfirm.input}
              onChange={(e) => setDeleteConfirm(prev => prev ? { ...prev, input: e.target.value } : null)}
              className="w-full h-11 px-3 rounded bg-white border border-border text-sm focus:outline-none focus:border-red-500"
              placeholder="Escribe el nombre aquí..."
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 bg-surface border border-border text-foreground font-medium rounded-pill text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm.input !== deleteConfirm.name}
                className="flex-1 h-11 bg-red-600 text-white font-bold rounded-pill disabled:opacity-50 text-sm"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
