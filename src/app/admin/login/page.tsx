"use client";

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
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-charcoal">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary-light" size={32} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient">
            Admin
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Panel de administración
          </p>
        </div>

        <div className="card !p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Usuario
              </label>
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
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Contraseña
              </label>
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
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3.5 disabled:opacity-50"
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
      </div>
    </div>
  );
}
