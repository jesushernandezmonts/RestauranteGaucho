"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        usuario,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Usuario o contraseña incorrectos");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden dark-section">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1410] via-[#1A1410] to-[#241C17]" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
              <Shield className="text-gold" size={28} />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-gold leading-tight drop-shadow-[0_4px_15px_rgba(232,171,47,0.2)]">
            Admin
          </h1>
          <p className="text-text-muted text-sm mt-2">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="card !p-6 sm:!p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(196,85,58,0.15)", border: "1px solid rgba(196,85,58,0.3)", color: "#D4715A" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-chocolate font-bold px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold text-base disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
        <div className="text-center mt-8 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-gold/70 hover:bg-white/10 hover:text-white"
          >
            ← Volver a la página principal
          </Link>
          <div>
            <Link
              href="/acceso"
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold tracking-wide text-chocolate shadow-gold transition-all duration-300 hover:scale-105 hover:bg-gold-light"
            >
              ← Elegir otro tipo de acceso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
