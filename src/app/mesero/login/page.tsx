"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";

export default function MeseroLoginPage() {
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
        setLoading(false);
        return;
      }

      router.push("/mesero");
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden dark-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1410] via-[#1A1410] to-[#241C17]" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3">🥩</div>
          <h1 className="font-display text-3xl font-bold text-gradient">
            Gaucho
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Acceso para meseros
          </p>
        </div>

        {/* Login Card */}
        <div className="card !p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-slide-down">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          Acceso solo para personal autorizado
        </p>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-2.5 text-sm font-medium tracking-wide text-gold shadow-[0_0_24px_rgba(232,171,47,0.12)] transition-all duration-300 hover:border-gold/70 hover:bg-gold/20 hover:text-gold hover:shadow-[0_0_34px_rgba(232,171,47,0.24)]"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
