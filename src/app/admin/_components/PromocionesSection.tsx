"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Check, Upload, X, Plus, Tag, Pencil, Trash2 } from "lucide-react";

type Promocion = {
  id: number;
  titulo: string;
  descripcion: string;
  descuento: string;
  imagen: string;
  fechaInicio: string;
  fechaFin: string | null;
  activo: boolean;
  destacado: boolean;
};

const emptyForm: Promocion = {
  id: 0,
  titulo: "",
  descripcion: "",
  descuento: "",
  imagen: "",
  fechaInicio: new Date().toISOString().slice(0, 16),
  fechaFin: null,
  activo: true,
  destacado: false,
};

export default function PromocionesSection() {
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<Promocion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    try {
      const res = await fetch("/api/promociones");
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: reader.result }),
        });
        const data = await res.json();
        if (data.url && editing) {
          setEditing({ ...editing, imagen: data.url });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        fechaInicio: editing.fechaInicio ? new Date(editing.fechaInicio).toISOString() : null,
        fechaFin: editing.fechaFin ? new Date(editing.fechaFin).toISOString() : null,
      };

      if (editing.id) {
        await fetch(`/api/promociones/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/promociones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setShowForm(false);
      setEditing(null);
      fetchPromos();

      // Notify other tabs
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

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    try {
      await fetch(`/api/promociones/${id}`, { method: "DELETE" });
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={28} style={{ color: "#E0C060" }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#F2E8D5" }}>Promociones</h2>
          <p className="text-sm mt-1" style={{ color: "#B89878" }}>
            Gestiona las ofertas y promociones del restaurante
          </p>
        </div>
        <button
          onClick={() => { setEditing({ ...emptyForm }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "rgba(212,162,58,0.15)", color: "#E0C060" }}
        >
          <Plus size={18} />
          Nueva promoción
        </button>
      </div>

      {/* Form */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: "#1A2A1E", border: "1px solid rgba(212,162,58,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold" style={{ color: "#E0C060" }}>
              {editing.id ? "Editar promoción" : "Nueva promoción"}
            </h3>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Título *</label>
              <input
                type="text"
                value={editing.titulo}
                onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Descuento</label>
              <input
                type="text"
                value={editing.descuento}
                onChange={(e) => setEditing({ ...editing, descuento: e.target.value })}
                placeholder="Ej: 15%, $50, 2x1"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Descripción</label>
              <textarea
                value={editing.descripcion}
                onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Inicio</label>
                <input
                  type="datetime-local"
                  value={editing.fechaInicio?.slice(0, 16) || ""}
                  onChange={(e) => setEditing({ ...editing, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Fin (opcional)</label>
                <input
                  type="datetime-local"
                  value={editing.fechaFin?.slice(0, 16) || ""}
                  onChange={(e) => setEditing({ ...editing, fechaFin: e.target.value || null })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,162,58,0.1)", color: "#D4C5B0" }}
                />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#D4C5B0" }}>Imagen</label>
              {editing.imagen && (
                <div className="relative mb-2 rounded-xl overflow-hidden w-full h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.imagen} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setEditing({ ...editing, imagen: "" })}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer" style={{ background: "rgba(212,162,58,0.1)", color: "#E0C060" }}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Subir imagen
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              </label>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#D4C5B0" }}>
                <input
                  type="checkbox"
                  checked={editing.activo}
                  onChange={(e) => setEditing({ ...editing, activo: e.target.checked })}
                  className="accent-gold"
                />
                Activa
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#D4C5B0" }}>
                <input
                  type="checkbox"
                  checked={editing.destacado}
                  onChange={(e) => setEditing({ ...editing, destacado: e.target.checked })}
                  className="accent-gold"
                />
                Destacada
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !editing.titulo}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: saved ? "rgba(76,175,80,0.2)" : "rgba(212,162,58,0.15)", color: saved ? "#81C784" : "#E0C060" }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-6 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", color: "#8A9A8E" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {promos.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#8A9A8E" }}>
          <Tag size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay promociones aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,162,58,0.1)" }}
            >
              {promo.imagen ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={promo.imagen} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,162,58,0.1)" }}>
                  <Tag size={20} style={{ color: "#E0C060" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "#F2E8D5" }}>{promo.titulo}</span>
                  {promo.descuento && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(196,30,58,0.15)", color: "#E85050" }}>
                      {promo.descuento}
                    </span>
                  )}
                  {promo.destacado && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,162,58,0.15)", color: "#E0C060" }}>
                      ⭐ Destacado
                    </span>
                  )}
                </div>
                {promo.descripcion && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#B89878" }}>{promo.descripcion}</p>
                )}
                <p className="text-xs mt-1" style={{ color: "#8A9A8E" }}>
                  {new Date(promo.fechaInicio).toLocaleDateString()}
                  {promo.fechaFin ? ` - ${new Date(promo.fechaFin).toLocaleDateString()}` : ""}
                  {!promo.activo && " · Inactiva"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setEditing({ ...promo }); setShowForm(true); }}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "#8A9A8E" }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "#C4553A" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
