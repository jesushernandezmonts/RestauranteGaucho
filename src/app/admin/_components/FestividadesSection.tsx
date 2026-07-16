"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Check, Sparkles } from "lucide-react";

const FESTIVIDADES = [
  { value: "ninguna", label: "Ninguna", emoji: "" },
  { value: "navidad", label: "🎄 Navidad", emoji: "🎄" },
  { value: "diademuertos", label: "💀 Día de Muertos", emoji: "💀" },
  { value: "sanvalentin", label: "❤️ San Valentín", emoji: "❤️" },
  { value: "fiestaspatrias", label: "🇲🇽 Fiestas Patrias", emoji: "🇲🇽" },
  { value: "semanasanta", label: "🐣 Semana Santa", emoji: "🐣" },
  { value: "añonuevo", label: "🎉 Año Nuevo", emoji: "🎉" },
  { value: "feriahuamantla", label: "🎈 Feria Huamantla", emoji: "🎈" },
  { value: "halloween", label: "🎃 Halloween", emoji: "🎃" },
];

export default function FestividadesSection() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function fetchConfig() {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConfig();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      try {
        const bc = new BroadcastChannel("gaucho_config_changes");
        bc.postMessage({ changed: true });
        bc.close();
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={28} style={{ color: "#E0C060" }} />
      </div>
    );
  }

  const selected = config.festividad_activa || "ninguna";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: "#F2E8D5" }}>Festividades</h2>
        <p className="text-sm mt-1" style={{ color: "#B89878" }}>
          Activa una temática festiva y toda la página se transformará automáticamente 🎨
        </p>
      </div>

      {/* Selector de festividad */}
      <div className="p-6 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}>
        <label className="block text-sm font-medium mb-3" style={{ color: "#E0C060" }}>
          Festividad activa
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-wrap">
          {FESTIVIDADES.map((f) => (
            <button
              key={f.value}
              onClick={() => setConfig((prev) => ({ ...prev, festividad_activa: f.value }))}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selected === f.value
                  ? "ring-2 ring-gold text-gold"
                  : "hover:bg-white/5 text-chocolate-light"
              }`}
              style={{
                background: selected === f.value ? "rgba(212,162,58,0.1)" : "rgba(255,255,255,0.04)",
              }}
            >
              <span className="text-lg">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje personalizado */}
      <div className="p-6 rounded-2xl mb-8 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#E0C060" }}>
            Título personalizado (opcional)
          </label>
          <input
            type="text"
            value={config.festividad_titulo || ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, festividad_titulo: e.target.value }))}
            placeholder='Ej: "🎄 Feliz Navidad desde Niño Gaucho"'
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#E0C060" }}>
            Mensaje corto (opcional)
          </label>
          <input
            type="text"
            value={config.festividad_mensaje || ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, festividad_mensaje: e.target.value }))}
            placeholder='Ej: "Disfruta nuestros cortes especiales en esta temporada"'
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
          />
        </div>
      </div>

      {/* Vista previa de colores */}
      {selected !== "ninguna" && (
        <div className="p-6 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: "#E0C060" }}>Vista previa de colores</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl" style={{ background: getFestividadColor(selected, "bg") }} title="Fondo" />
            <div className="w-10 h-10 rounded-xl" style={{ background: getFestividadColor(selected, "primary") }} title="Color primario" />
            <div className="w-10 h-10 rounded-xl" style={{ background: getFestividadColor(selected, "accent") }} title="Color acento" />
            <div className="w-10 h-10 rounded-xl" style={{ background: getFestividadColor(selected, "text") }} title="Color texto" />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
        style={{ background: saved ? "rgba(76,175,80,0.2)" : "rgba(212,162,58,0.15)", color: saved ? "#81C784" : "#E0C060" }}
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <Check size={18} />
        ) : (
          <Sparkles size={18} />
        )}
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Activar festividad"}
      </button>
    </div>
  );
}

function getFestividadColor(festividad: string, type: "bg" | "primary" | "accent" | "text"): string {
  const colors: Record<string, Record<string, string>> = {
    navidad: { bg: "#1A3A2A", primary: "#C41E3A", accent: "#FFD700", text: "#F5F5F0" },
    diademuertos: { bg: "#1A0A2E", primary: "#FF6B35", accent: "#E8A838", text: "#F5E6D0" },
    sanvalentin: { bg: "#2D0A1A", primary: "#E91E63", accent: "#FFD700", text: "#F5E6F0" },
    fiestaspatrias: { bg: "#0A2D1A", primary: "#006847", accent: "#CE1126", text: "#F5F0E6" },
    semanasanta: { bg: "#1A1A2E", primary: "#7B2D8E", accent: "#E8A838", text: "#F0E6F0" },
    añonuevo: { bg: "#0A0A2E", primary: "#1A1A5E", accent: "#FFD700", text: "#E6F0F5" },
    feriahuamantla: { bg: "#1A0A2E", primary: "#FF4081", accent: "#E8A838", text: "#F5E6F5" },
    halloween: { bg: "#0A0A0A", primary: "#FF6D00", accent: "#7C4DFF", text: "#F0E6D0" },
  };
  const c = colors[festividad] || colors.ninguna || { bg: "#1A2A1E", primary: "#D4A23A", accent: "#8BA877", text: "#F2E8D5" };
  return c[type];
}
