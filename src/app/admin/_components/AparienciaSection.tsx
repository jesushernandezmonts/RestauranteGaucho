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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const mainKeys = CONFIG_KEYS.filter((k) => !k.gallery);
  const galleryKeys = CONFIG_KEYS.filter((k) => k.gallery);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            Personalización de la Apariencia
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Personaliza cada elemento visual del menú principal de tu restaurante
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary !px-4 !py-2 text-sm font-medium w-full sm:w-auto"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar Cambios"}
        </button>
      </div>

      {/* Main images */}
      <div className="space-y-6 mb-10">
        {mainKeys.map((item) => (
          <div
            key={item.key}
            className="card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium mb-1 text-text-muted">
                {item.label}
              </label>
              <input
                type="text"
                value={config[item.key] || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, [item.key]: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-light border border-primary/10 text-text-primary"
              />
            </div>
            <label className="btn-secondary !px-3 !py-2 text-xs font-medium shrink-0 w-full sm:w-auto">
              {uploading === item.key ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {uploading === item.key ? "Subiendo..." : "Subir Imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(item.key, f);
                }}
              />
            </label>
            {config[item.key] && (
              <div className="relative w-full sm:w-24 h-20 rounded-lg overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config[item.key]}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, [item.key]: "" }))
                  }
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery images and labels */}
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Galería</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryKeys
          .filter((_, i) => i % 2 === 0)
          .map((item, index) => {
            const imgKey = item.key;
            const labelKey = galleryKeys[index * 2 + 1].key;
            return (
              <div key={imgKey} className="card p-4 sm:p-6 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.label.replace(" - Parrilla", "").replace("Galería ", "")}
                </h3>
                {/* Image upload */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium mb-1 text-text-muted">
                      Imagen ({item.label.split(" - ")[1]})
                    </label>
                    <input
                      type="text"
                      value={config[imgKey] || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          [imgKey]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-light border border-primary/10 text-text-primary"
                    />
                  </div>
                  <label className="btn-secondary !px-3 !py-2 text-xs font-medium shrink-0 w-full sm:w-auto">
                    {uploading === imgKey ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploading === imgKey ? "Subiendo..." : "Subir Imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(imgKey, f);
                      }}
                    />
                  </label>
                  {config[imgKey] && (
                    <div className="relative w-full sm:w-24 h-20 rounded-lg overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config[imgKey]}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, [imgKey]: "" }))
                        }
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                {/* Label input */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-text-muted">
                    Etiqueta ({galleryKeys[index * 2 + 1].label.split(" - ")[1]})
                  </label>
                  <input
                    type="text"
                    value={config[labelKey] || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        [labelKey]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-light border border-primary/10 text-text-primary"
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
