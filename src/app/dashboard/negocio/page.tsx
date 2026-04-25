"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ImageUpload } from "@/components/shared/ImageUpload";

const CATEGORIES = [
  { id: "", name: "Selecciona una categoría" },
  { id: "comidas", name: "🍽️ Comidas y Restaurantes" },
  { id: "ferreterias", name: "🔧 Ferreterías" },
  { id: "salud", name: "💊 Salud y Farmacias" },
  { id: "moda", name: "👗 Moda y Ropa" },
  { id: "tiendas", name: "🛒 Supermercados y Tiendas" },
  { id: "belleza", name: "💈 Belleza y Peluquerías" },
  { id: "tecnologia", name: "📱 Tecnología y Celulares" },
  { id: "transporte", name: "🚗 Transporte" },
  { id: "educacion", name: "📚 Educación" },
  { id: "hogar", name: "🏠 Servicios del Hogar" },
  { id: "entretenimiento", name: "🎉 Entretenimiento" },
  { id: "otros", name: "📦 Otros" },
];

const DAYS = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];

const inputClass = "w-full h-12 px-4 rounded-card bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm";
const labelClass = "block text-sm font-semibold text-foreground mb-1";

export default function NegocioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", categorySlug: "", description: "", phone: "",
    address: "", whatsapp: "", instagram: "", facebook: "", website: "",
    coverImage: "",
  });

  const [schedule, setSchedule] = useState<Record<string, { open: string; close: string; enabled: boolean }>>(() =>
    Object.fromEntries(DAYS.map(d => [d, { open: "08:00", close: "18:00", enabled: false }]))
  );

  useEffect(() => {
    fetch("/api/dashboard/business")
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setIsEdit(true);
          const b = res.data;
          setForm({
            name: b.name || "", categorySlug: b.category?.slug || "",
            description: b.description || "", phone: b.phone || "",
            address: b.address || "", whatsapp: b.whatsapp || "",
            instagram: b.instagram || "", facebook: b.facebook || "",
            website: b.website || "", coverImage: b.coverImage || "",
          });
          if (b.schedule) {
            setSchedule(prev => {
              const next = { ...prev };
              for (const day of DAYS) {
                if (b.schedule[day]) {
                  next[day] = { ...b.schedule[day], enabled: true };
                }
              }
              return next;
            });
          }
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    if (!form.name || !form.categorySlug) {
      setError("Nombre y categoría son obligatorios"); setLoading(false); return;
    }

    // Build schedule from enabled days
    const scheduleData: Record<string, { open: string; close: string }> = {};
    for (const day of DAYS) {
      if (schedule[day].enabled) {
        scheduleData[day] = { open: schedule[day].open, close: schedule[day].close };
      }
    }

    // We need to look up categoryId by slug
    const catRes = await fetch("/api/categories").then(r => r.json());
    const cats: any[] = catRes.data || [];
    const category = cats.find((c: any) => c.slug === form.categorySlug);
    if (!category) { setError("Categoría inválida"); setLoading(false); return; }

    const body = {
      name: form.name, categoryId: category.id, description: form.description,
      phone: form.phone, address: form.address, whatsapp: form.whatsapp,
      instagram: form.instagram || null, facebook: form.facebook || null,
      website: form.website || null, schedule: scheduleData,
      coverImage: form.coverImage || null,
    };

    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch("/api/dashboard/business", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Error al guardar"); }
    else {
      setSuccess(isEdit ? "¡Negocio actualizado correctamente!" : "¡Negocio creado! Está en revisión.");
      if (!isEdit) setTimeout(() => router.push("/dashboard"), 2000);
    }
    setLoading(false);
  };

  if (fetching) return <div className="text-center py-20 text-muted text-sm">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">{isEdit ? "Editar negocio" : "Registrar negocio"}</h1>
        <p className="text-sm text-muted mt-0.5">{isEdit ? "Actualiza los datos de tu negocio" : "Completa la información de tu negocio"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-card text-sm font-medium">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 rounded-card text-sm font-medium">{success}</div>}

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <h2 className="font-bold text-foreground">Imagen principal (Cover)</h2>
          <ImageUpload 
            value={form.coverImage} 
            onChange={(url) => setForm(f => ({ ...f, coverImage: url }))} 
            folder="businesses" 
            aspectRatio="cover" 
          />
        </div>

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <h2 className="font-bold text-foreground">Información básica</h2>

          <div>
            <label className={labelClass}>Nombre del negocio *</label>
            <input type="text" value={form.name} onChange={set("name")} required className={inputClass} placeholder="Ej: Tienda La Economía" />
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <select value={form.categorySlug} onChange={set("categorySlug")} required className={inputClass}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              className="w-full px-4 py-3 rounded-card bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none"
              placeholder="Describe tu negocio brevemente..." />
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <h2 className="font-bold text-foreground">Contacto y ubicación</h2>
          <div>
            <label className={labelClass}>Teléfono *</label>
            <input type="tel" value={form.phone} onChange={set("phone")} required className={inputClass} placeholder="3XX XXX XXXX" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} className={inputClass} placeholder="57XXXXXXXXXX" />
          </div>
          <div>
            <label className={labelClass}>Dirección *</label>
            <input type="text" value={form.address} onChange={set("address")} required className={inputClass} placeholder="Calle 4 # 5-60, Centro" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <h2 className="font-bold text-foreground">Redes sociales</h2>
          <div>
            <label className={labelClass}>Instagram</label>
            <input type="url" value={form.instagram} onChange={set("instagram")} className={inputClass} placeholder="https://instagram.com/tunegocio" />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input type="url" value={form.facebook} onChange={set("facebook")} className={inputClass} placeholder="https://facebook.com/tunegocio" />
          </div>
          <div>
            <label className={labelClass}>Sitio web</label>
            <input type="url" value={form.website} onChange={set("website")} className={inputClass} placeholder="https://tunegocio.com" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-5 space-y-4">
          <h2 className="font-bold text-foreground">Horario de atención</h2>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3">
                <input type="checkbox" id={`day-${day}`} checked={schedule[day].enabled}
                  onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], enabled: e.target.checked } }))}
                  className="accent-accent w-4 h-4 rounded flex-shrink-0"
                />
                <label htmlFor={`day-${day}`} className="text-sm font-medium text-foreground capitalize w-24">{day}</label>
                {schedule[day].enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={schedule[day].open}
                      onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], open: e.target.value } }))}
                      className="flex-1 h-9 px-2 rounded-card bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-muted">a</span>
                    <input type="time" value={schedule[day].close}
                      onChange={e => setSchedule(s => ({ ...s, [day]: { ...s[day], close: e.target.value } }))}
                      className="flex-1 h-9 px-2 rounded-card bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full h-12 bg-accent text-white font-bold rounded-pill disabled:opacity-70 active:scale-95 transition-all">
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear negocio"}
        </button>
      </form>
    </div>
  );
}
