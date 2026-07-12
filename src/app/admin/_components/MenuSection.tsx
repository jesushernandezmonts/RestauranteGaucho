"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  X,
  Layers,
  FlaskConical,
  ChevronDown,
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
  imagen?: string;
  ingredientesDestacados?: string;
  _count?: { receta: number };
};

export default function MenuSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlatillo, setEditPlatillo] = useState<Platillo | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Categoria | null>(null);
  const [showNewDish, setShowNewDish] = useState(false);
  const [newDishCatId, setNewDishCatId] = useState<number | null>(null);
  const [recetaModal, setRecetaModal] = useState<Platillo | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  function toggleCategory(catId: number) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }

  function broadcastMenuChange() {
    try {
      new BroadcastChannel("gaucho_menu_changes").postMessage("updated");
    } catch {}
  }

  useEffect(() => {
    loadMenu();
  }, []);

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
        platillos:
          platillos.find((p: Categoria) => p.id === cat.id)?.platillos || [],
      }));
      setCategorias(merged);
      // Start with first category expanded
      if (merged.length > 0 && expandedCats.size === 0) {
        setExpandedCats(new Set([merged[0].id]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSaved() {
    broadcastMenuChange();
    setEditPlatillo(null);
    setShowNewDish(false);
    setShowCategoryModal(false);
    loadMenu();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Menú
            </h1>
            <p className="text-sm text-text-muted">Platillos y categorías</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Expand all
                setExpandedCats(new Set(categorias.map((c) => c.id)));
              }}
              className="text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg transition-colors"
            >
              Expandir todo
            </button>
            <button
              onClick={() => {
                // Collapse all
                setExpandedCats(new Set());
              }}
              className="text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg transition-colors"
            >
              Colapsar todo
            </button>
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setEditCategory(null);
              }}
              className="btn-secondary !px-4 !py-2 text-sm"
            >
              <Layers size={16} /> Categoría
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {categorias.map((cat) => {
            const isExpanded = expandedCats.has(cat.id);
            return (
              <div key={cat.id} className="card !p-0 overflow-hidden">
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-light/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icono}</span>
                    <h3 className="font-semibold text-text-primary">
                      {cat.nombre}
                    </h3>
                    <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-surface-light/80">
                      {cat.platillos.length} platillos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1"
                    >
                      <button
                        onClick={() => {
                          setEditCategory(cat);
                          setShowCategoryModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-surface-light"
                        title="Editar categoría"
                      >
                        <Pencil size={14} className="text-text-muted" />
                      </button>
                      <button
                        onClick={() => {
                          setNewDishCatId(cat.id);
                          setShowNewDish(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-medium hover:bg-primary/20"
                      >
                        <Plus size={12} /> Platillo
                      </button>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-text-muted transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Category Content - Collapsible */}
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isExpanded ? `${(cat.platillos.length + 1) * 60}px` : "0px",
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <div className="space-y-2 px-4 pb-4">
                    {cat.platillos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {p.imagen && (
                              <img
                                src={p.imagen}
                                alt={p.nombre}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <span
                              className={`font-medium text-sm ${
                                p.activo
                                  ? "text-text-primary"
                                  : "text-text-muted line-through"
                              }`}
                            >
                              {p.nombre}
                            </span>
                            {!p.activo && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-text-muted/10 text-text-muted">
                                Inactivo
                              </span>
                            )}
                          </div>
                          {p.descripcion && (
                            <p className="text-xs text-text-muted truncate mt-0.5">
                              {p.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary-light text-sm">
                            ${p.precio}
                          </span>
                          <button
                            onClick={() => setRecetaModal(p)}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-lighter ${
                              (p._count?.receta ?? 0) > 0
                                ? "text-gold"
                                : "text-text-muted"
                            }`}
                            title="Receta"
                          >
                            <FlaskConical size={14} />
                          </button>
                          <button
                            onClick={() => setEditPlatillo(p)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-lighter transition-all"
                          >
                            <Pencil size={14} className="text-text-muted" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {cat.platillos.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">
                        Sin platillos aún
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modals */}
        {editPlatillo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-text-primary">
                  Editar Platillo
                </h3>
                <button
                  onClick={() => setEditPlatillo(null)}
                  className="p-1 rounded-lg hover:bg-surface-light"
                >
                  <X size={18} />
                </button>
              </div>
              <PlatilloForm platillo={editPlatillo} onSaved={handleSaved} />
            </div>
          </div>
        )}

        {showNewDish && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-text-primary">
                  Nuevo Platillo
                </h3>
                <button
                  onClick={() => setShowNewDish(false)}
                  className="p-1 rounded-lg hover:bg-surface-light"
                >
                  <X size={18} />
                </button>
              </div>
              <PlatilloForm
                isNew={true}
                categoriaId={newDishCatId || undefined}
                onSaved={handleSaved}
              />
            </div>
          </div>
        )}

        {showCategoryModal && (
          <CategoryModal
            cat={editCategory}
            onClose={() => setShowCategoryModal(false)}
            onSaved={handleSaved}
          />
        )}

        {recetaModal && (
          <RecetaModal
            platillo={recetaModal}
            onClose={() => setRecetaModal(null)}
          />
        )}
      </div>
    </div>
  );
}

function PlatilloForm({
  platillo,
  isNew,
  categoriaId,
  onSaved,
}: {
  platillo?: Platillo;
  isNew?: boolean;
  categoriaId?: number;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(platillo?.nombre || "");
  const [descripcion, setDescripcion] = useState(platillo?.descripcion || "");
  const [precio, setPrecio] = useState(platillo?.precio || 0);
  const [activo, setActivo] = useState(platillo?.activo ?? true);
  const [imagen, setImagen] = useState(platillo?.imagen || "");
  const [ingredientesDestacados, setIngredientesDestacados] = useState(platillo?.ingredientesDestacados || "");
  const [uploading, setUploading] = useState(false);
  const [catId, setCatId] = useState(categoriaId || 0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew)
      fetch("/api/categorias")
        .then((r) => r.json())
        .then(setCategorias);
  }, [isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = "/api/platillos";
      const method = isNew ? "POST" : "PATCH";
      const body: Record<string, unknown> = {};
      if (isNew) {
        body.nombre = nombre;
        body.descripcion = descripcion;
        body.precio = precio;
        body.categoriaId = catId;
        body.imagen = imagen;
      } else {
        body.id = platillo!.id;
        body.nombre = nombre;
        body.precio = precio;
        body.activo = activo;
        body.descripcion = descripcion;
        body.imagen = imagen;
        body.ingredientesDestacados = ingredientesDestacados;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isNew && (
        <select
          value={catId}
          onChange={(e) => setCatId(parseInt(e.target.value))}
          className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        >
          <option value={0}>Seleccionar categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icono} {c.nombre}
            </option>
          ))}
        </select>
      )}
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        required
      />
      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
      />

      {/* Ingredientes Destacados */}
      <div>
        <label className="text-xs text-text-muted mb-2 block">
          Ingredientes destacados
        </label>
        <textarea
          placeholder="Ej: Carne, Queso, Chimichurri, Papas"
          value={ingredientesDestacados}
          onChange={(e) => setIngredientesDestacados(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="text-xs text-text-muted mb-2 block">
          Imagen del platillo
        </label>
        {imagen && (
          <div className="mb-2 relative inline-block">
            <img
              src={imagen}
              alt="Preview"
              className="w-24 h-24 rounded-xl object-cover border border-primary/10"
            />
            <button
              type="button"
              onClick={() => setImagen("")}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center text-xs"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-light border border-primary/10 cursor-pointer hover:bg-surface-lighter transition-colors text-sm text-text-secondary">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                // Convert file to base64 data URL
                const reader = new FileReader();
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
                const res = await fetch("/api/upload", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ dataUrl }),
                });
                const data = await res.json();
                if (data.url) setImagen(data.url);
              } catch (err) {
                console.error(err);
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading ? "Subiendo..." : imagen ? "Cambiar imagen" : "Subir imagen"}
        </label>
      </div>
      <input
        type="number"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        required
      />
      {!isNew && (
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="accent-primary"
          />{" "}
          Activo
        </label>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSaved}
          className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium"
        >
          {saving ? "..." : isNew ? "Crear" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function CategoryModal({
  cat,
  onClose,
  onSaved,
}: {
  cat: Categoria | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(cat?.nombre || "");
  const [icono, setIcono] = useState(cat?.icono || "🍽️");
  const [orden, setOrden] = useState(cat?.orden || 0);
  const [saving, setSaving] = useState(false);

  const iconos = [
    "🥞", "🇲🇽", "🍝", "🍕", "🥣", "🥩", "🥦", "🥪", "🥗", "🥤", "🍹", "🍽️", "🧀", "🌮", "🍔",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = cat ? "PATCH" : "POST";
      const body = cat
        ? { id: cat.id, nombre, icono, orden }
        : { nombre, icono, orden };
      const res = await fetch("/api/categorias", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">
            {cat ? "Editar" : "Nueva"} Categoría
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />
        <div>
          <label className="text-xs text-text-muted mb-2 block">Icono</label>
          <div className="flex flex-wrap gap-2">
            {iconos.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcono(ic)}
                className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition-all ${
                  icono === ic
                    ? "border-primary/40 bg-primary/10"
                    : "border-primary/10 bg-surface-light"
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <input
          type="number"
          placeholder="Orden"
          value={orden}
          onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium"
          >
            {saving ? "..." : "Guardar"}
          </button>
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

function RecetaModal({
  platillo,
  onClose,
}: {
  platillo: Platillo;
  onClose: () => void;
}) {
  const [ingredientes, setIngredientes] = useState<RecetaIngrediente[]>([]);
  const [allIngs, setAllIngs] = useState<
    { id: number; nombre: string; unidad: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecipe();
    loadAllIngredients();
  }, []);

  async function loadRecipe() {
    try {
      const res = await fetch(`/api/platillos/${platillo.id}/receta`);
      const data = await res.json();
      if (data.receta) {
        setIngredientes(
          data.receta.map(
            (r: {
              ingredienteId: number;
              cantidad: number;
              ingrediente: { nombre: string; unidad: string };
            }) => ({
              ingredienteId: r.ingredienteId,
              nombre: r.ingrediente.nombre,
              cantidad: r.cantidad,
              unidad: r.ingrediente.unidad,
            })
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllIngredients() {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setAllIngs(data.ingredientes || []);
    } catch (e) {
      console.error(e);
    }
  }

  function addIngredient() {
    const first = allIngs.find(
      (i) => !ingredientes.find((r) => r.ingredienteId === i.id)
    );
    if (!first) return;
    setIngredientes([
      ...ingredientes,
      { ingredienteId: first.id, nombre: first.nombre, cantidad: 1, unidad: first.unidad },
    ]);
  }

  function removeIngredient(idx: number) {
    setIngredientes(ingredientes.filter((_, i) => i !== idx));
  }

  function updateIngredient(
    idx: number,
    field: keyof RecetaIngrediente,
    value: string | number
  ) {
    const updated = [...ingredientes];
    if (field === "ingredienteId") {
      const ing = allIngs.find((i) => i.id === value);
      if (ing) {
        updated[idx] = {
          ...updated[idx],
          ingredienteId: ing.id,
          nombre: ing.nombre,
          unidad: ing.unidad,
        };
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
          ingredientes: ingredientes.map((i) => ({
            ingredienteId: i.ingredienteId,
            cantidad: i.cantidad,
          })),
        }),
      });
      try {
        new BroadcastChannel("gaucho_menu_changes").postMessage("updated");
      } catch {}
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const availableIngs = allIngs.filter(
    (i) => !ingredientes.find((r) => r.ingredienteId === i.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-2xl border border-primary/10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface rounded-t-2xl p-5 pb-3 border-b border-primary/10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">🧾 Receta</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {platillo.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-text-muted" />
            </div>
          ) : (
            <>
              {ingredientes.length === 0 && (
                <p className="text-sm text-text-muted text-center py-6">
                  Esta platillo no tiene ingredientes asociados. Agrega los que
                  necesites y el stock se descontará automáticamente al hacer un
                  pedido.
                </p>
              )}

              {ingredientes.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={ing.ingredienteId}
                    onChange={(e) =>
                      updateIngredient(idx, "ingredienteId", parseInt(e.target.value))
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
                  >
                    {allIngs.map((a) => (
                      <option
                        key={a.id}
                        value={a.id}
                        disabled={!!ingredientes.find((r, ri) => r.ingredienteId === a.id && ri !== idx)}
                      >
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={ing.cantidad}
                    onChange={(e) =>
                      updateIngredient(idx, "cantidad", parseFloat(e.target.value) || 0)
                    }
                    className="w-20 px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm text-center"
                  />
                  <span className="text-xs text-text-muted w-12">
                    {ing.unidad}
                  </span>
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {availableIngs.length > 0 && (
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-2 text-sm text-primary-light hover:text-primary px-1 py-1 transition-all"
                >
                  <Plus size={16} /> Agregar ingrediente
                </button>
              )}

              {availableIngs.length === 0 && ingredientes.length > 0 && (
                <p className="text-xs text-text-muted text-center pt-2">
                  Todos los ingredientes están agregados
                </p>
              )}
            </>
          )}
        </div>

        <div className="p-5 pt-3 border-t border-primary/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "Guardar Receta"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
