"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  Plus,
  Pencil,
  X,
  Layers,
  FlaskConical,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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
  _count?: { receta: number };
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
  const [recetaModal, setRecetaModal] = useState<Platillo | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<number>>(new Set());
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  function broadcastMenuChange() {
    try { new BroadcastChannel("gaucho_menu_changes").postMessage("updated"); } catch {}
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  async function loadMenu() {
    try {
      const [catRes, platRes] = await Promise.all([
        fetch("/api/categorias"),
        fetch("/api/platillos"),
      ]);
      const cats = await catRes.json();
      const platillos = await platRes.json();
      const merged = cats.map((cat: Categoria) => ({
        ...cat,
        platillos: platillos.find((p: Categoria) => p.id === cat.id)?.platillos || [],
      }));
      setCategorias(merged);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  function handleSaved() {
    broadcastMenuChange();
    setEditPlatillo(null);
    setShowNewDish(false);
    setShowCategoryModal(false);
    loadMenu();
  }

  async function handleDeletePlatillo(p: Platillo) {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/platillos?id=${p.id}`, { method: "DELETE" });
      if (res.ok) {
        broadcastMenuChange();
        loadMenu();
      }
    } catch (e) { console.error(e); }
  }

  function toggleCatExpand(catId: number) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center dark-section"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  const allExpanded = collapsedCats.size === 0;

  return (
    <div className="min-h-screen dark-section p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronLeft size={20} className="text-white" /></Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Menú</h1>
              <p className="text-sm text-white/50">Platillos y categorías</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {categorias.length > 0 && (
              <>
                {!allExpanded ? (
                  <button onClick={() => { setCollapsedCats(new Set()); setExpandedCats(new Set()); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/15 text-[#D4A23A] text-xs font-medium hover:bg-primary/25 transition-all border border-primary/25">
                    <ChevronDown size={14} /> Expandir todo
                  </button>
                ) : (
                  <button onClick={() => { setCollapsedCats(new Set(categorias.map(c => c.id))); setExpandedCats(new Set()); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white/70 text-xs font-medium hover:bg-white/15 transition-all border border-white/10">
                    <ChevronRight size={14} /> Colapsar todo
                  </button>
                )}
              </>
            )}
            <button onClick={() => { setShowCategoryModal(true); setEditCategory(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#D4A23A]/30 text-[#D4A23A] hover:bg-[#D4A23A]/10 hover:border-[#D4A23A] transition-all text-sm font-medium">
              <Layers size={16} /> Categoría
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categorias.map((cat) => {
            const isCollapsed = collapsedCats.has(cat.id);
            const isExpanded = expandedCats.has(cat.id);
            const showPlatillos = collapsedCats.size === 0 ? !isCollapsed : isExpanded;

            return (
              <div key={cat.id} className="rounded-2xl border border-white/10 bg-[#1A1410] overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCatExpand(cat.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icono}</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-white text-base">{cat.nombre}</h3>
                      <p className="text-xs text-white/40">{cat.platillos.length} platillo{cat.platillos.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditCategory(cat); setShowCategoryModal(true); }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                      title="Editar categoría"
                    >
                      <Pencil size={14} className="text-white/60" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setNewDishCatId(cat.id); setShowNewDish(true); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#D4A23A]/15 text-[#D4A23A] text-xs font-medium hover:bg-[#D4A23A]/25 transition-all border border-[#D4A23A]/20"
                    >
                      <Plus size={12} /> Platillo
                    </button>
                    {showPlatillos ? (
                      <ChevronDown size={18} className="text-white/40" />
                    ) : (
                      <ChevronRight size={18} className="text-white/40" />
                    )}
                  </div>
                </button>

                {/* Platillos */}
                {showPlatillos && (
                  <div className="px-5 pb-4 space-y-2">
                    {cat.platillos.length === 0 && (
                      <p className="text-sm text-white/40 text-center py-6 bg-white/[0.03] rounded-xl border border-dashed border-white/10">
                        Sin platillos — agrega uno con el botón &quot;+ Platillo&quot;
                      </p>
                    )}
                    {cat.platillos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-[#252018] border border-white/10 hover:border-[#D4A23A]/30 hover:bg-[#2D2118] transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`font-medium text-[15px] ${p.activo ? "text-white" : "text-white/40 line-through"}`}>
                              {p.nombre}
                            </span>
                            {!p.activo && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium border border-white/10">
                                Inactivo
                              </span>
                            )}
                          </div>
                          {p.descripcion && (
                            <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{p.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                          <span className="font-bold text-[#D4A23A] text-sm mr-1">${p.precio}</span>
                          <button
                            onClick={() => setRecetaModal(p)}
                            className={`p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all ${(p._count?.receta ?? 0) > 0 ? "text-[#D4A23A]" : "text-white/40"}`}
                            title="Receta"
                          >
                            <FlaskConical size={14} />
                          </button>
                          <button
                            onClick={() => setEditPlatillo(p)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-[#D4A23A]"
                            title="Editar platillo"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePlatillo(p)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-red-500/15 transition-all text-white/40 hover:text-red-400"
                            title="Eliminar platillo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {categorias.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/50 mb-4">No hay categorías aún</p>
            <button onClick={() => { setShowCategoryModal(true); setEditCategory(null); }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4A23A]/15 text-[#D4A23A] font-medium border border-[#D4A23A]/20 hover:bg-[#D4A23A]/25 transition-all mx-auto">
              <Layers size={16} /> Crear primera categoría
            </button>
          </div>
        )}

        {/* Modals */}
        {editPlatillo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1512] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Editar Platillo</h3>
                <button onClick={() => setEditPlatillo(null)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} className="text-white/60" /></button>
              </div>
              <PlatilloForm platillo={editPlatillo} onSaved={handleSaved} />
            </div>
          </div>
        )}

        {showNewDish && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1512] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Nuevo Platillo</h3>
                <button onClick={() => setShowNewDish(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} className="text-white/60" /></button>
              </div>
              <PlatilloForm isNew={true} categoriaId={newDishCatId || undefined} onSaved={handleSaved} />
            </div>
          </div>
        )}

        {showCategoryModal && <CategoryModal cat={editCategory} onClose={() => setShowCategoryModal(false)} onSaved={handleSaved} />}

        {recetaModal && <RecetaModal platillo={recetaModal} onClose={() => setRecetaModal(null)} />}
      </div>
    </div>
  );
}

// ─── PLATILLO FORM ────────────────────────────────────

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
      const url = "/api/platillos";
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
        <select value={catId} onChange={e => setCatId(parseInt(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" required>
          <option value={0}>Seleccionar categoría</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
      )}
      <input placeholder="Nombre del platillo" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" required />
      <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" />
      <input type="number" step="0.01" placeholder="Precio" value={precio} onChange={e => setPrecio(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" required />
      {!isNew && (
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="accent-[#D4A23A] w-4 h-4" /> Activo
        </label>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onSaved} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition-all">Cancelar</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#D4A23A]/15 text-[#D4A23A] text-sm font-medium hover:bg-[#D4A23A]/25 transition-all">{saving ? "..." : (isNew ? "Crear" : "Guardar")}</button>
      </div>
    </form>
  );
}

// ─── CATEGORY MODAL ───────────────────────────────────

function CategoryModal({ cat, onClose, onSaved }: { cat: Categoria | null; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(cat?.nombre || "");
  const [icono, setIcono] = useState(cat?.icono || "🍽️");
  const [orden, setOrden] = useState(cat?.orden || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNombre(cat?.nombre || "");
    setIcono(cat?.icono || "🍽️");
    setOrden(cat?.orden || 0);
  }, [cat]);

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
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1512] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white">{cat ? "Editar" : "Nueva"} Categoría</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X size={18} className="text-white/60" /></button>
        </div>
        <input placeholder="Nombre de la categoría" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" required />
        <div>
          <label className="text-xs text-white/50 mb-2 block">Icono</label>
          <div className="flex flex-wrap gap-2">
            {iconos.map((ic) => (
              <button key={ic} type="button" onClick={() => setIcono(ic)} className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition-all ${icono === ic ? "border-[#D4A23A]/40 bg-[#D4A23A]/10" : "border-white/10 bg-[#252018] hover:bg-[#2D2118]"}`}>{ic}</button>
            ))}
          </div>
        </div>
        <input type="number" placeholder="Orden" value={orden} onChange={e => setOrden(parseInt(e.target.value) || 0)} className="w-full px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm" />
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition-all">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#D4A23A]/15 text-[#D4A23A] text-sm font-medium hover:bg-[#D4A23A]/25 transition-all">{saving ? "..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

// ─── RECETA MODAL ───────────────────────────────────

type RecetaIngrediente = {
  ingredienteId: number;
  nombre: string;
  cantidad: number;
  unidad: string;
};

function RecetaModal({ platillo, onClose }: { platillo: Platillo; onClose: () => void }) {
  const [ingredientes, setIngredientes] = useState<RecetaIngrediente[]>([]);
  const [allIngs, setAllIngs] = useState<{ id: number; nombre: string; unidad: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRecipe() {
    try {
      const res = await fetch(`/api/platillos/${platillo.id}/receta`);
      const data = await res.json();
      if (data.receta) {
        setIngredientes(
          data.receta.map((r: { ingredienteId: number; cantidad: number; ingrediente: { nombre: string; unidad: string } }) => ({
            ingredienteId: r.ingredienteId,
            nombre: r.ingrediente.nombre,
            cantidad: r.cantidad,
            unidad: r.ingrediente.unidad,
          }))
        );
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadAllIngredients() {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setAllIngs(data.ingredientes || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    loadRecipe();
    loadAllIngredients();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  function addIngredient() {
    const first = allIngs.find((i) => !ingredientes.find((r) => r.ingredienteId === i.id));
    if (!first) return;
    setIngredientes([...ingredientes, { ingredienteId: first.id, nombre: first.nombre, cantidad: 1, unidad: first.unidad }]);
  }

  function removeIngredient(idx: number) {
    setIngredientes(ingredientes.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: keyof RecetaIngrediente, value: string | number) {
    const updated = [...ingredientes];
    if (field === "ingredienteId") {
      const ing = allIngs.find((i) => i.id === value);
      if (ing) {
        updated[idx] = { ...updated[idx], ingredienteId: ing.id, nombre: ing.nombre, unidad: ing.unidad };
      }
    } else if (field === "cantidad") {
      updated[idx] = { ...updated[idx], cantidad: value as number };
    }
    setIngredientes(updated);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/platillos/${platillo.id}/receta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientes: ingredientes.map((i) => ({ ingredienteId: i.ingredienteId, cantidad: i.cantidad })),
        }),
      });
      try { new BroadcastChannel("gaucho_menu_changes").postMessage("updated"); } catch {}
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  const availableIngs = allIngs.filter((i) => !ingredientes.find((r) => r.ingredienteId === i.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1A1512] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#1A1512] rounded-t-2xl p-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">🧾 Receta</h3>
            <p className="text-xs text-white/50 mt-0.5">{platillo.nombre}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X size={18} className="text-white/60" /></button>
        </div>

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-white/40" /></div>
          ) : (
            <>
              {ingredientes.length === 0 && (
                <p className="text-sm text-white/50 text-center py-6">
                  Esta platillo no tiene ingredientes asociados. Agrega los que necesites y el stock se descontará automáticamente al hacer un pedido.
                </p>
              )}

              {ingredientes.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={ing.ingredienteId}
                    onChange={(e) => updateIngredient(idx, "ingredienteId", parseInt(e.target.value))}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm"
                  >
                    {allIngs.map((a) => (
                      <option key={a.id} value={a.id} disabled={!!ingredientes.find((r, ri) => r.ingredienteId === a.id && ri !== idx)}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={ing.cantidad}
                    onChange={(e) => updateIngredient(idx, "cantidad", parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2.5 rounded-xl bg-[#252018] border border-white/10 text-white text-sm text-center"
                  />
                  <span className="text-xs text-white/50 w-12">{ing.unidad}</span>
                  <button onClick={() => removeIngredient(idx)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all">
                    <X size={16} />
                  </button>
                </div>
              ))}

              {availableIngs.length > 0 && (
                <button onClick={addIngredient} className="flex items-center gap-2 text-sm text-[#D4A23A] hover:text-[#E0B050] px-1 py-1 transition-all">
                  <Plus size={16} /> Agregar ingrediente
                </button>
              )}

              {availableIngs.length === 0 && ingredientes.length > 0 && (
                <p className="text-xs text-white/40 text-center pt-2">Todos los ingredientes están agregados</p>
              )}
            </>
          )}
        </div>

        <div className="p-5 pt-3 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#D4A23A]/15 text-[#D4A23A] text-sm font-medium hover:bg-[#D4A23A]/25 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Guardar Receta"}
          </button>
        </div>
      </div>
    </div>
  );
}
