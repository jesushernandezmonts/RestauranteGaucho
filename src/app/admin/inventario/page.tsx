"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  Package,
  Plus,
  X,
  AlertTriangle,
  History,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

type Ingrediente = {
  id: number;
  nombre: string;
  unidad: string;
  stock: number;
  stockMinimo: number;
  costoSugerido: number;
};

type Movimiento = {
  id: number;
  tipo: string;
  cantidad: number;
  referencia: string;
  createdAt: string;
  ingrediente: { nombre: string };
};

export default function AdminInventarioFullPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editIng, setEditIng] = useState<Ingrediente | null>(null);
  const [deleteIng, setDeleteIng] = useState<Ingrediente | null>(null);
  const [tab, setTab] = useState<"inventario" | "movimientos">("inventario");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setIngredientes(data.ingredientes || []);
      setMovimientos(data.movimientos || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch("/api/inventario", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDeleteIng(null);
        loadData();
      }
    } catch (e) { console.error(e); }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center dark-section"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen dark-section p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-light"><ChevronLeft size={20} /></Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">Inventario</h1>
              <p className="text-sm text-text-muted">Gestión de ingredientes y stock</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary !px-4 !py-2 text-sm">
            <Plus size={16} /> Ingrediente
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface max-w-xs">
          <button onClick={() => setTab("inventario")} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === "inventario" ? "bg-surface-light text-text-primary" : "text-text-muted"}`}>
            <Package size={14} className="inline mr-1" /> Inventario
          </button>
          <button onClick={() => setTab("movimientos")} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === "movimientos" ? "bg-surface-light text-text-primary" : "text-text-muted"}`}>
            <History size={14} className="inline mr-1" /> Movimientos
          </button>
        </div>

        {tab === "inventario" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredientes.map((ing) => {
              const isLow = ing.stock <= ing.stockMinimo;
              return (
                <div key={ing.id} className={`card group ${isLow ? "border-danger/20" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{ing.nombre}</h3>
                      <p className="text-xs text-text-muted">{ing.unidad}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditIng(ing)} className="p-1.5 rounded-lg hover:bg-surface-light" title="Editar">
                        <Pencil size={14} className="text-text-muted hover:text-primary" />
                      </button>
                      <button onClick={() => setDeleteIng(ing)} className="p-1.5 rounded-lg hover:bg-danger/10" title="Eliminar">
                        <Trash2 size={14} className="text-text-muted hover:text-danger" />
                      </button>
                    </div>
                  </div>
                  {ing.costoSugerido > 0 && (
                    <div className="text-xs text-text-muted mb-2">Costo: ${ing.costoSugerido}</div>
                  )}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${isLow ? "text-danger" : "text-text-primary"}`}>{ing.stock}</div>
                      <div className="text-xs text-text-muted">Mín: {ing.stockMinimo} {ing.unidad}</div>
                    </div>
                    {isLow && <AlertTriangle size={18} className="text-danger" />}
                  </div>
                  {isLow && (
                    <div className="mt-3 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium">
                      Stock bajo — {ing.stock}/{ing.stockMinimo}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">Ingrediente</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">Tipo</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase">Cantidad</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">Referencia</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-light/30">
                    <td className="px-6 py-4 text-sm text-text-primary">{m.ingrediente?.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${m.tipo === "ENTRADA" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {m.tipo === "ENTRADA" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">{m.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-text-muted truncate max-w-[200px]">{m.referencia}</td>
                    <td className="px-6 py-4 text-right text-sm text-text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        {showCreate && <IngredienteFormModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); loadData(); }} />}
        {editIng && <EditIngredienteModal ing={editIng} onClose={() => setEditIng(null)} onSaved={() => { setEditIng(null); loadData(); }} />}
        {deleteIng && <ConfirmDeleteModal nombre={deleteIng.nombre} onConfirm={() => handleDelete(deleteIng.id)} onCancel={() => setDeleteIng(null)} />}
      </div>
    </div>
  );
}

function IngredienteFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("pieza");
  const [stock, setStock] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(10);
  const [costoSugerido, setCostoSugerido] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) return;
    setSaving(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, unidad, stock, stockMinimo, costoSugerido }),
      });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Nuevo Ingrediente</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
        </div>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        <select value={unidad} onChange={e => setUnidad(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm">
          <option value="pieza">Pieza</option>
          <option value="kg">Kilogramo</option>
          <option value="g">Gramo</option>
          <option value="l">Litro</option>
          <option value="ml">Mililitro</option>
          <option value="porcion">Porción</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-text-muted mb-1 block">Stock inicial</label>
          <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" /></div>
          <div><label className="text-xs text-text-muted mb-1 block">Stock mínimo</label>
          <input type="number" value={stockMinimo} onChange={e => setStockMinimo(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" /></div>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Costo sugerido ($)</label>
          <input type="number" step="0.01" value={costoSugerido} onChange={e => setCostoSugerido(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium">{saving ? "..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

function EditIngredienteModal({ ing, onClose, onSaved }: { ing: Ingrediente; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(ing.nombre);
  const [unidad, setUnidad] = useState(ing.unidad);
  const [stock, setStock] = useState(ing.stock);
  const [stockMinimo, setStockMinimo] = useState(ing.stockMinimo);
  const [costoSugerido, setCostoSugerido] = useState(ing.costoSugerido);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ing.id, nombre, unidad, stock, stockMinimo, costoSugerido }),
      });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Editar Ingrediente</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Unidad</label>
          <select value={unidad} onChange={e => setUnidad(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm">
            <option value="pieza">Pieza</option>
            <option value="kg">Kilogramo</option>
            <option value="g">Gramo</option>
            <option value="l">Litro</option>
            <option value="ml">Mililitro</option>
            <option value="porcion">Porción</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-text-muted mb-1 block">Stock</label>
          <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" /></div>
          <div><label className="text-xs text-text-muted mb-1 block">Stock mínimo</label>
          <input type="number" value={stockMinimo} onChange={e => setStockMinimo(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" /></div>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Costo sugerido ($)</label>
          <input type="number" step="0.01" value={costoSugerido} onChange={e => setCostoSugerido(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium">{saving ? "..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDeleteModal({ nombre, onConfirm, onCancel }: { nombre: string; onConfirm: () => void; onCancel: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-danger/10">
            <AlertCircle size={20} className="text-danger" />
          </div>
          <h3 className="font-semibold text-text-primary">Eliminar ingrediente</h3>
        </div>
        <p className="text-sm text-text-muted">
          ¿Estás seguro de eliminar <strong className="text-text-primary">{nombre}</strong>?
          Esta acción eliminará también las recetas asociadas y no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors">
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
