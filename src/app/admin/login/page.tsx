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
    <div className="min-h-screen flex items-center justify-center p-4 dark-section" style={{ background: "#3D2A1C" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
              <Shield className="text-gold" size={28} />
            </div>
          </div>
          <h1 className="font-script text-3xl md:text-4xl text-gold leading-tight drop-shadow-[0_4px_15px_rgba(232,171,47,0.2)]">
            Admin
          </h1>
          <p className="text-white/50 text-sm mt-2">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-gold transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-gold transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
      </div>
    </div>
  );
}
