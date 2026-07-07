"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, Plus, Pencil, X, Layers } from "lucide-react";

type Categoria = {
  id: number;
  nombre: string;
  icono: string;
  orden: number;
  platillos: Platillo[];
  _count?: { platillos: number };
};

type Platillo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
};

export default function AdminMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlatillo, setEditPlatillo] = useState<Platillo | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Categoria | null>(null);
  const [showNewDish, setShowNewDish] = useState(false);
  const [newDishCatId, setNewDishCatId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => { loadMenu(); }, []);

  async function loadMenu() {
    try {
      const [catRes, platRes] = await Promise.all([
        fetch("/api/categorias"),
        fetch("/api/platillos"),
      ]);
      const cats = await catRes.json();
      // Get complete platillos per cat
      const platillos = await platRes.json();
      // Merge: use categorias list with full platillo data
      const merged = cats.map((cat: Categoria) => ({
        ...cat,
        platillos: platillos.find((p: Categoria) => p.id === cat.id)?.platillos || [],
      }));
      setCategorias(merged);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-charcoal"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-charcoal p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-light"><ChevronLeft size={20} /></Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">Menú</h1>
              <p className="text-sm text-text-muted">Platillos y categorías</p>
            </div>
          </div>
          <button onClick={() => { setShowCategoryModal(true); setEditCategory(null); }} className="btn-secondary !px-4 !py-2 text-sm mr-2">
            <Layers size={16} /> Categoría
          </button>
        </div>

        <div className="space-y-6">
          {categorias.map((cat) => (
            <div key={cat.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icono}</span>
                  <h3 className="font-semibold text-text-primary">{cat.nombre}</h3>
                  <span className="text-xs text-text-muted">({cat.platillos.length} platillos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditCategory(cat); setShowCategoryModal(true); }} className="p-1.5 rounded-lg hover:bg-surface-light" title="Editar categoría">
                    <Pencil size={14} className="text-text-muted" />
                  </button>
                  <button onClick={() => { setNewDishCatId(cat.id); setShowNewDish(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-medium hover:bg-primary/20">
                    <Plus size={12} /> Platillo
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {cat.platillos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${p.activo ? "text-text-primary" : "text-text-muted line-through"}`}>{p.nombre}</span>
                        {!p.activo && <span className="text-xs px-2 py-0.5 rounded-full bg-text-muted/10 text-text-muted">Inactivo</span>}
                      </div>
                      {p.descripcion && <p className="text-xs text-text-muted truncate mt-0.5">{p.descripcion}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-light text-sm">${p.precio}</span>
                      <button onClick={() => setEditPlatillo(p)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-lighter transition-all">
                        <Pencil size={14} className="text-text-muted" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Platillo Edit Modal */}
        {editPlatillo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-text-primary">Editar Platillo</h3>
                <button onClick={() => setEditPlatillo(null)} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
              </div>
              <PlatilloForm platillo={editPlatillo} onSaved={() => { setEditPlatillo(null); loadMenu(); }} />
            </div>
          </div>
        )}

        {/* New Dish Modal */}
        {showNewDish && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-text-primary">Nuevo Platillo</h3>
                <button onClick={() => setShowNewDish(false)} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
              </div>
              <PlatilloForm isNew={true} categoriaId={newDishCatId || undefined} onSaved={() => { setShowNewDish(false); loadMenu(); }} />
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && <CategoryModal cat={editCategory} onClose={() => setShowCategoryModal(false)} onSaved={() => { setShowCategoryModal(false); loadMenu(); }} />}
      </div>
    </div>
  );
}

function PlatilloForm({ platillo, isNew, categoriaId, onSaved }: { platillo?: Platillo; isNew?: boolean; categoriaId?: number; onSaved: () => void }) {
  const [nombre, setNombre] = useState(platillo?.nombre || "");
  const [descripcion, setDescripcion] = useState(platillo?.descripcion || "");
  const [precio, setPrecio] = useState(platillo?.precio || 0);
  const [activo, setActivo] = useState(platillo?.activo ?? true);
  const [catId, setCatId] = useState(categoriaId || 0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  }, [isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? "/api/platillos" : "/api/platillos";
      const method = isNew ? "POST" : "PATCH";
      const body: Record<string, unknown> = {};
      if (isNew) { body.nombre = nombre; body.descripcion = descripcion; body.precio = precio; body.categoriaId = catId; }
      else { body.id = platillo!.id; body.nombre = nombre; body.precio = precio; body.activo = activo; body.descripcion = descripcion; }
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isNew && (
        <select value={catId} onChange={e => setCatId(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required>
          <option value={0}>Seleccionar categoría</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
      )}
      <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
      <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" />
      <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
      {!isNew && (
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="accent-primary" /> Activo
        </label>
      )}
      <div className="flex gap-3">
        <button type="button" onClick={onSaved} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium">{saving ? "..." : (isNew ? "Crear" : "Guardar")}</button>
      </div>
    </form>
  );
}

function CategoryModal({ cat, onClose, onSaved }: { cat: Categoria | null; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(cat?.nombre || "");
  const [icono, setIcono] = useState(cat?.icono || "🍽️");
  const [orden, setOrden] = useState(cat?.orden || 0);
  const [saving, setSaving] = useState(false);

  const iconos = ["🥞", "🇲🇽", "🍝", "🍕", "🥣", "🥩", "🥦", "🥪", "🥗", "🥤", "🍹", "🍽️", "🧀", "🌮", "🍔"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = cat ? "PATCH" : "POST";
      const body = cat ? { id: cat.id, nombre, icono, orden } : { nombre, icono, orden };
      const res = await fetch("/api/categorias", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">{cat ? "Editar" : "Nueva"} Categoría</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
        </div>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        <div>
          <label className="text-xs text-text-muted mb-2 block">Icono</label>
          <div className="flex flex-wrap gap-2">
            {iconos.map((ic) => (
              <button key={ic} type="button" onClick={() => setIcono(ic)} className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition-all ${icono === ic ? "border-primary/40 bg-primary/10" : "border-primary/10 bg-surface-light"}`}>{ic}</button>
            ))}
          </div>
        </div>
        <input type="number" placeholder="Orden" value={orden} onChange={e => setOrden(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium">{saving ? "..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
