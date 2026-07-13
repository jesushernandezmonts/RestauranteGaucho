"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Check, Upload, X } from "lucide-react";

const CONFIG_KEYS = [
  { key: "hero_fondo", label: "Fondo del Hero (portada)" },
  { key: "logo_url", label: "Logo del restaurante" },
  { key: "about_imagen", label: "Imagen 'Nuestra Historia'" },
  { key: "galeria_1_img", label: "Galería 1 - Parrilla", gallery: true },
  { key: "galeria_1_label", label: "Galería 1 - Etiqueta", gallery: true },
  { key: "galeria_2_img", label: "Galería 2 - Ambiente", gallery: true },
  { key: "galeria_2_label", label: "Galería 2 - Etiqueta", gallery: true },
  { key: "galeria_3_img", label: "Galería 3 - Platillos", gallery: true },
  { key: "galeria_3_label", label: "Galería 3 - Etiqueta", gallery: true },
  { key: "galeria_4_img", label: "Galería 4 - Cortes", gallery: true },
  { key: "galeria_4_label", label: "Galería 4 - Etiqueta", gallery: true },
  { key: "galeria_5_img", label: "Galería 5 - Pastas", gallery: true },
  { key: "galeria_5_label", label: "Galería 5 - Etiqueta", gallery: true },
  { key: "galeria_6_img", label: "Galería 6 - Bar", gallery: true },
  { key: "galeria_6_label", label: "Galería 6 - Etiqueta", gallery: true },
  { key: "galeria_7_img", label: "Galería 7 - Vinos", gallery: true },
  { key: "galeria_7_label", label: "Galería 7 - Etiqueta", gallery: true },
  { key: "galeria_8_img", label: "Galería 8 - Postres", gallery: true },
  { key: "galeria_8_label", label: "Galería 8 - Etiqueta", gallery: true },
];

export default function AparienciaSection() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
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

  async function handleImageUpload(key: string, file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploading(key);
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          setConfig((prev) => ({ ...prev, [key]: uploadData.url }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Only save the keys that exist in our list (filter non-gallery labels if needed)
      const payload: Record<string, string> = {};
      for (const item of CONFIG_KEYS) {
        if (config[item.key] !== undefined) {
          payload[item.key] = config[item.key];
        }
      }
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Notify other tabs instantly
        try {
          const bc = new BroadcastChannel("gaucho_config_changes");
          bc.postMessage({ changed: true });
          bc.close();
        } catch {}
      }
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

  const mainKeys = CONFIG_KEYS.filter((k) => !k.gallery);
  const galleryKeys = CONFIG_KEYS.filter((k) => k.gallery);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: "#F2E8D5" }}>Apariencia</h2>
        <p className="text-sm mt-1" style={{ color: "#B89878" }}>
          Personaliza las imágenes y etiquetas del sitio web
        </p>
      </div>

      {/* Main images */}
      <div className="space-y-6 mb-10">
        {mainKeys.map((item) => (
          <div
            key={item.key}
            className="p-5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: "#E0C060" }}>
              {item.label}
            </label>
            {config[item.key] && (
              <div className="relative mb-3 rounded-xl overflow-hidden w-full max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config[item.key]}
                  alt={item.label}
                  className="w-full h-36 object-cover"
                />
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, [item.key]: "" }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer transition-all" style={{ background: "rgba(212,162,58,0.1)", color: "#E0C060" }}>
              {uploading === item.key ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading === item.key ? "Subiendo..." : "Subir imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(item.key, file);
                }}
              />
            </label>
            <input
              type="text"
              value={config[item.key] || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.value }))}
              placeholder="O pega una URL..."
              className="mt-2 w-full px-3 py-2 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
            />
          </div>
        ))}
      </div>

      {/* Gallery */}
      <h3 className="text-lg font-semibold mb-4" style={{ color: "#E0C060" }}>Galería de imágenes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {galleryKeys.map((item) => (
          <div
            key={item.key}
            className="p-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}
          >
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#D4C5B0" }}>
              {item.label}
            </label>
            {item.key.endsWith("_img") ? (
              <>
                {config[item.key] && (
                  <div className="relative mb-2 rounded-lg overflow-hidden w-full h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config[item.key]}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, [item.key]: "" }))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer" style={{ background: "rgba(212,162,58,0.1)", color: "#E0C060" }}>
                  {uploading === item.key ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  Subir
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(item.key, file);
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={config[item.key] || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.value }))}
                  placeholder="URL..."
                  className="mt-2 w-full px-2 py-1.5 rounded-lg text-xs"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
                />
              </>
            ) : (
              <input
                type="text"
                value={config[item.key] || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.value }))}
                placeholder="Etiqueta..."
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
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
          <Save size={18} />
        )}
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}
