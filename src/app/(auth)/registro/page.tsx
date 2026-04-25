"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GoogleLogo } from "@phosphor-icons/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
      } else {
        // Redirigir al login o hacer auto-login
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Ocurrió un error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 max-w-lg mx-auto pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground">Crear cuenta</h1>
        <p className="text-muted mt-2 text-sm">Únete a VillaMarket para publicar o opinar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-card text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-pill bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-pill bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-pill bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 bg-accent text-white font-bold rounded-pill disabled:opacity-70 active:scale-95 transition-all"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-xs text-muted font-medium uppercase">O regístrate con</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full h-12 flex items-center justify-center gap-2 bg-surface text-foreground font-medium rounded-pill border border-border active:scale-95 transition-all"
      >
        <GoogleLogo size={20} weight="bold" />
        Google
      </button>

      <p className="text-center text-sm text-muted mt-8">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent font-bold hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}
