"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Plus, Pencil, Trash2, Check, X, CalendarDays, Percent, Tag, DollarSign, Text, Package, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type Promocion = {
  id: number;
  nombre: string;
  tipo: "PORCENTAJE" | "CANTIDAD" | "ENVIO_GRATIS";
  valor: number;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string;
  codigo: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
};

export default function PromocionesSection() {
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promocion | null>(null);
  const [deletePromoId, setDeletePromoId] = useState<number | null>(null);

  async function fetchPromos() {
    try {
      const res = await fetch("/api/promociones", { cache: "no-store" });
      setPromos(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPromos();
  }, []);

  async function handleToggleActive(id: number, activo: boolean) {
    try {
      await fetch("/api/promociones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo }),
      });
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch("/api/promociones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDeletePromoId(null);
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Promociones
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Administrar ofertas y descuentos
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary !px-4 !py-2 text-sm w-full sm:w-auto"
          >
            <Plus size={16} /> Nueva Promoción
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`card group flex flex-col justify-between ${
                promo.activo ? "" : "opacity-50 grayscale"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-text-primary">
                    {promo.nombre}
                  </h3>
                  <p className="text-xs text-text-muted">{promo.descripcion}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(promo);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-surface-light"
                    title="Editar"
                  >
                    <Pencil size={14} className="text-text-muted hover:text-primary" />
                  </button>
                  <button
                    onClick={() => setDeletePromoId(promo.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10"
                    title="Eliminar"
                  >
                    <Trash2 size={14} className="text-text-muted hover:text-danger" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-text-primary mb-2">
                Código: <span className="font-medium">{promo.codigo}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>
                  {format(new Date(promo.fechaInicio), "dd MMM yy", { locale: es })} -{" "}
                  {format(new Date(promo.fechaFin), "dd MMM yy", { locale: es })}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promo.activo
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {promo.activo ? "Activa" : "Inactiva"}
                </span>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promo.activo}
                  onChange={() => handleToggleActive(promo.id, !promo.activo)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                <span className="text-sm font-medium text-text-muted">
                  {promo.activo ? "Activa" : "Inactiva"}
                </span>
              </label>
            </div>
          ))}
        </div>

        {showForm && (
          <PromocionFormModal
            onClose={() => setShowForm(false)}
            onSaved={fetchPromos}
            editing={editing}
            setEditing={setEditing}
          />
        )}

        {deletePromoId && (
          <ConfirmDeleteModal
            onConfirm={() => handleDelete(deletePromoId)}
            onCancel={() => setDeletePromoId(null)}
          />
        )}
      </div>
    </div>
  );
}

function PromocionFormModal({
  onClose,
  onSaved,
  editing,
  setEditing,
}: {
  onClose: () => void;
  onSaved: () => void;
  editing: Promocion | null;
  setEditing: (p: Promocion | null) => void;
}) {
  const [nombre, setNombre] = useState(editing?.nombre || "");
  const [tipo, setTipo] = useState<"PORCENTAJE" | "CANTIDAD" | "ENVIO_GRATIS">(
    editing?.tipo || "PORCENTAJE"
  );
  const [valor, setValor] = useState(editing?.valor || 0);
  const [activo, setActivo] = useState(editing?.activo ?? true);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(
    editing?.fechaInicio ? new Date(editing.fechaInicio) : null
  );
  const [fechaFin, setFechaFin] = useState<Date | null>(
    editing?.fechaFin ? new Date(editing.fechaFin) : null
  );
  const [codigo, setCodigo] = useState(editing?.codigo || "");
  const [descripcion, setDescripcion] = useState(editing?.descripcion || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !fechaInicio || !fechaFin || !codigo) return;
    setSaving(true);
    try {
      const payload = {
        nombre,
        tipo,
        valor,
        activo,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        codigo,
        descripcion,
      };
      const res = await fetch("/api/promociones", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      if (res.ok) {
        // Optimistic update: immediately reflect the change locally
        if (editing) {
          onSaved(); // Triggers a re-fetch, but optimistic update is handled locally in parent
        } else {
          onSaved(); // Triggers a re-fetch for new promo with real ID
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      onClose(); // Close modal after saving
    }
  }

  const tipoOptions = useMemo(
    () => [
      { value: "PORCENTAJE", label: "Porcentaje", icon: <Percent size={16} /> },
      { value: "CANTIDAD", label: "Cantidad", icon: <DollarSign size={16} /> },
      { value: "ENVIO_GRATIS", label: "Envío Gratis", icon: <Package size={16} /> },
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-4 sm:p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">
            {editing ? "Editar Promoción" : "Nueva Promoción"}
          </h3>
          <button
            type="button"
            onClick={() => {
              onClose();
              setEditing(null);
            }}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>

        <input
          placeholder="Nombre de la promoción"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />
        <textarea
          placeholder="Descripción (ej: '10% de descuento en tu primera compra')"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          rows={3}
        />
        <input
          placeholder="Código (ej: VERANO20)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              Fecha de Inicio
            </label>
            <DatePicker
              selected={fechaInicio}
              onChange={(date: Date | null) => setFechaInicio(date)}
              dateFormat="dd/MM/yyyy"
              locale={es}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
              wrapperClassName="w-full"
              required
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              Fecha de Fin
            </label>
            <DatePicker
              selected={fechaFin}
              onChange={(date: Date | null) => setFechaFin(date)}
              dateFormat="dd/MM/yyyy"
              locale={es}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
              wrapperClassName="w-full"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {tipoOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTipo(opt.value as typeof tipo)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tipo === opt.value
                  ? "bg-primary/10 text-primary-light"
                  : "bg-surface-light text-text-muted hover:bg-surface-lighter"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {tipo !== "ENVIO_GRATIS" && (
          <div>
            <label className="text-xs text-text-muted mb-1 block">
              Valor {tipo === "PORCENTAJE" ? "(%)" : "($)"}
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
              step={tipo === "PORCENTAJE" ? "1" : "0.01"}
              min={0}
              required
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
          <span className="text-sm font-medium text-text-muted">
            {activo ? "Activa" : "Inactiva"}
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              setEditing(null);
            }}
            className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium"
          >
            {saving ? "..." : editing ? "Guardar Cambios" : "Crear Promoción"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-primary/10 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-danger/10">
            <AlertCircle size={20} className="text-danger" />
          </div>
          <h3 className="font-semibold text-text-primary">Eliminar Promoción</h3>
        </div>
        <p className="text-sm text-text-muted">
          ¿Estás seguro de eliminar esta promoción? Esta acción no se puede deshacer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
