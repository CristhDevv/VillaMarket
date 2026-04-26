"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { GoogleLogo } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Credenciales inválidas. Intenta nuevamente.");
      } else {
        // Obtener la sesión actualizada para determinar el rol
        const session = await getSession();
        const role = session?.user?.role;

        let destination = "/";
        if (role === "ADMIN") destination = "/admin";
        else if (role === "OWNER") destination = "/dashboard";
        
        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 max-w-lg mx-auto pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground">Bienvenido de nuevo</h1>
        <p className="text-muted mt-2 text-sm">Inicia sesión en VillaMarket</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-card text-sm text-center font-medium">
            {error}
          </div>
        )}

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
          {loading ? "Iniciando..." : "Ingresar"}
        </button>
      </form>

      {/* Botones de acceso rápido para pruebas */}
      <div className="mt-8 space-y-2">
        <p className="text-[10px] text-center text-muted uppercase font-bold tracking-widest mb-3">Acceso rápido (Pruebas)</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => { setEmail("admin@villamarket.com"); setPassword("test1234"); }}
            className="text-[10px] py-2 bg-surface border border-border rounded-pill hover:bg-accent/5 transition-all font-bold text-foreground"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => { setEmail("owner@villamarket.com"); setPassword("test1234"); }}
            className="text-[10px] py-2 bg-surface border border-border rounded-pill hover:bg-accent/5 transition-all font-bold text-foreground"
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => { setEmail("customer@villamarket.com"); setPassword("test1234"); }}
            className="text-[10px] py-2 bg-surface border border-border rounded-pill hover:bg-accent/5 transition-all font-bold text-foreground"
          >
            Cliente
          </button>
        </div>
      </div>

      {/* 
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-xs text-muted font-medium uppercase">O ingresa con</span>
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
      */}

      <p className="text-center text-sm text-muted mt-8">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent font-bold hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
