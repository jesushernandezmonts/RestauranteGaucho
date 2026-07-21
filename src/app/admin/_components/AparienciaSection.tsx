"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Check, Upload, X, Sliders, Maximize2 } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  async function fetchConfig() {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setIsInitialLoad(false), 300);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConfig();
  }, []);

  // Auto-save effect with 500ms debounce
  useEffect(() => {
    if (isInitialLoad || loading) return;

    setSaving(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        if (res.ok) {
          setSaved(true);
          try {
            const bc = new BroadcastChannel("gaucho_config_changes");
            bc.postMessage({ changed: true });
            bc.close();
          } catch {}
          setTimeout(() => setSaved(false), 2000);
        }
      } catch (e) {
        console.error("Auto-save error:", e);
      } finally {
        setSaving(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config, isInitialLoad, loading]);

  async function handleImageUpload(key: string, file: File) {
    setUploading(key);
    try {
      let dataUrl: string;
      if (file.type.startsWith("image/")) {
        try {
          dataUrl = await compressImage(file, 1200, 0.7);
        } catch (e) {
          console.warn("Compression failed, using original", e);
          dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      } else {
        const reader = new FileReader();
        dataUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
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
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
            Personaliza cada elemento visual y encuadre de las imágenes de tu restaurante
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-surface-light border border-white/10 text-gray-300">
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>Guardando cambios...</span>
              </>
            ) : saved ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Guardado automático</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-guardado activo</span>
              </>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !px-4 !py-2 text-sm font-medium w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar Ahora"}
          </button>
        </div>
      </div>

      {/* Main images */}
      <div className="space-y-6 mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-white">Imágenes Principales</h2>
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
            <label className="btn-secondary !px-3 !py-2 text-xs font-medium shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer">
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
              <div className="relative w-full sm:w-24 h-20 rounded-lg overflow-hidden shrink-0 border border-primary/20">
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
                  className="absolute top-1 right-1 bg-black/70 hover:bg-black rounded-full p-1 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery images and labels */}
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Galería de Imágenes</h2>
      <p className="text-sm text-gray-400 mb-6">
        Modifica la foto, la etiqueta, el ancho y el estilo de encuadre para cada platillo o sección.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {galleryKeys
          .filter((_, i) => i % 2 === 0)
          .map((item, index) => {
            const idx = index + 1;
            const imgKey = item.key;
            const labelKey = galleryKeys[index * 2 + 1].key;
            
            const fitKey = `galeria_${idx}_fit`;
            const posKey = `galeria_${idx}_position`;
            const aspectKey = `galeria_${idx}_aspect`;
            const spanKey = `galeria_${idx}_span`;

            const currentImg = config[imgKey] || "";
            const currentLabel = config[labelKey] || "";
            const currentFit = config[fitKey] || "cover";
            const currentPos = config[posKey] || "center";
            const currentAspect = config[aspectKey] || "auto";
            const currentSpan = config[spanKey] || (idx === 5 ? "double" : "normal");

            const sectionName = item.label.replace(" - ", " (").concat(")");

            return (
              <div key={imgKey} className="card p-5 space-y-4 border border-white/5 hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {idx}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {item.label.split(" - ")[1] || item.label}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded">
                    {sectionName}
                  </span>
                </div>

                {/* Live Preview box */}
                <div className="space-y-1">
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                    <Maximize2 size={12} /> Vista previa de encuadre:
                  </span>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/40 border border-primary/20 flex items-center justify-center">
                    {currentImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentImg}
                        alt="preview"
                        className="w-full h-full transition-all duration-300"
                        style={{
                          objectFit: currentFit as any,
                          objectPosition: currentPos as any,
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">Sin imagen seleccionada</span>
                    )}
                    {currentLabel && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                        <span className="text-xs text-white font-medium">{currentLabel}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image upload & URL */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-text-muted">
                    URL de la Imagen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentImg}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          [imgKey]: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-light border border-primary/10 text-text-primary"
                    />
                    <label className="btn-secondary !px-3 !py-2 text-xs font-medium shrink-0 flex items-center gap-1 cursor-pointer">
                      {uploading === imgKey ? (
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
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(imgKey, f);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Label input */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-text-muted">
                    Etiqueta / Texto
                  </label>
                  <input
                    type="text"
                    value={currentLabel}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        [labelKey]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-surface-light border border-primary/10 text-text-primary"
                  />
                </div>

                {/* Image Controls: Width/Span, Object Fit, Position, Aspect */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Sliders size={14} />
                    <span>Ajustes de Tamaño y Posición</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Width / Grid Span */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Ancho en galería</label>
                      <select
                        value={currentSpan}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, [spanKey]: e.target.value }))
                        }
                        className="w-full bg-surface-light border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="normal">Normal (1 Columna)</option>
                        <option value="double">Doble Ancho (Destacado)</option>
                      </select>
                    </div>

                    {/* Object Fit */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Ajuste (Object-fit)</label>
                      <select
                        value={currentFit}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, [fitKey]: e.target.value }))
                        }
                        className="w-full bg-surface-light border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="cover">Cubrir (Rellenar sin deformar)</option>
                        <option value="contain">Contener (Ver foto completa)</option>
                        <option value="fill">Estirar (Ajustar a marco)</option>
                      </select>
                    </div>

                    {/* Object Position */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Enfoque / Alineación</label>
                      <select
                        value={currentPos}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, [posKey]: e.target.value }))
                        }
                        className="w-full bg-surface-light border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="center">Centro</option>
                        <option value="top">Arriba</option>
                        <option value="bottom">Abajo</option>
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Proporción (Aspect)</label>
                      <select
                        value={currentAspect}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, [aspectKey]: e.target.value }))
                        }
                        className="w-full bg-surface-light border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="auto">Automático</option>
                        <option value="square">Cuadrado (1:1)</option>
                        <option value="video">Panorámico (16:9)</option>
                        <option value="tall">Vertical (3:4)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

