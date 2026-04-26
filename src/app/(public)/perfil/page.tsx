"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, EnvelopeSimple, Phone, ShieldCheck, CalendarBlank } from "@phosphor-icons/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  image: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setProfile(data.data);
            setForm({
              name: data.data.name || "",
              phone: data.data.phone || "",
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al actualizar perfil");
      } else {
        setSuccess("Perfil actualizado correctamente");
        setProfile(data.data);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted mt-4 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) return null;

  const initial = (profile.name || profile.email)[0].toUpperCase();
  const roleLabels: Record<string, string> = {
    CUSTOMER: "Cliente",
    OWNER: "Dueño",
    ADMIN: "Admin",
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Header Profile */}
      <div className="bg-white border border-border rounded-card p-6 shadow-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-black mb-4 shadow-md">
          {initial}
        </div>
        <h1 className="text-2xl font-black text-foreground">{profile.name || "Usuario"}</h1>
        <p className="text-sm text-muted">{profile.email}</p>
        
        <div className="flex gap-2 mt-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface border border-border rounded-pill text-xs font-bold text-foreground">
            <ShieldCheck size={14} className="text-accent" />
            {roleLabels[profile.role] || profile.role}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface border border-border rounded-pill text-xs font-medium text-muted">
            <CalendarBlank size={14} />
            {format(new Date(profile.createdAt), "MMM yyyy", { locale: es })}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Información personal</h2>
        
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-xs font-medium">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-xs font-medium">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Read-only */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeSimple size={16} className="text-muted" />
              </div>
              <input 
                type="email" 
                value={profile.email} 
                disabled 
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-surface border border-border text-muted text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-muted font-medium mt-1">El email no se puede cambiar</p>
          </div>

          {/* Nombre Editable */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Nombre completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-muted" />
              </div>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Tu nombre completo"
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Phone Editable */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Teléfono</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={16} className="text-muted" />
              </div>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Ingresa tu número de contacto"
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full h-11 mt-2 bg-accent text-white font-bold rounded-pill text-sm disabled:opacity-70 active:scale-95 transition-all flex items-center justify-center shadow-md"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
