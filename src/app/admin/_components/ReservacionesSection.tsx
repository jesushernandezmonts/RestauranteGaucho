"use client";

import { useEffect, useState } from "react";
import { Loader2, CalendarDays, Trash2, AlertCircle } from "lucide-react";

type Reservacion = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  notas: string;
  estado: string;
  createdAt: string;
};

const estadoColors: Record<string, string> = {
  pendiente: "bg-warning/10 text-warning",
  confirmada: "bg-success/10 text-success",
  cancelada: "bg-danger/10 text-danger",
};

export default function ReservacionesSection() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRes, setDeleteRes] = useState<Reservacion | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/reservaciones");
      setReservaciones(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateEstado(id: number, estado: string) {
    await fetch("/api/reservaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado }),
    });
    load();
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch("/api/reservaciones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDeleteRes(null);
        load();
      }
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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              Reservaciones
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Administrar reservas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservaciones.map((r) => (
            <div key={r.id} className="card group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {r.nombre}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {r.telefono && `📞 ${r.telefono}`}{" "}
                    {r.email && `· ✉️ ${r.email}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      estadoColors[r.estado] || "bg-surface-light text-text-muted"
                    }`}
                  >
                    {r.estado}
                  </span>
                  <button
                    onClick={() => setDeleteRes(r)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 transition-all"
                    title="Eliminar reservación"
                  >
                    <Trash2 size={14} className="text-text-muted hover:text-danger" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Fecha</div>
                  <div className="text-sm font-medium text-text-primary">
                    {new Date(r.fecha).toLocaleDateString("es-MX")}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Hora</div>
                  <div className="text-sm font-medium text-text-primary">
                    {r.hora}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Personas</div>
                  <div className="text-sm font-medium text-text-primary">
                    {r.personas}
                  </div>
                </div>
              </div>
              {r.notas && (
                <p className="text-sm text-text-muted mb-3">📝 {r.notas}</p>
              )}
              <div className="flex gap-2 items-center">
                {r.telefono && (
                  <a
                    href={`https://wa.me/52${r.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola ${r.nombre}, te escribimos de Niño Gaucho para confirmar tu reservación del ${new Date(r.fecha).toLocaleDateString("es-MX")} a las ${r.hora}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
                {r.estado === "pendiente" && (
                  <>
                    <button
                      onClick={() => updateEstado(r.id, "confirmada")}
                      className="px-4 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20"
                    >
                      ✅ Confirmar
                    </button>
                    <button
                      onClick={() => updateEstado(r.id, "cancelada")}
                      className="px-4 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20"
                    >
                      ❌ Cancelar
                    </button>
                  </>
                )}
                {r.estado === "confirmada" && (
                  <span className="text-xs text-text-muted">✅ Confirmada</span>
                )}
              </div>
            </div>
          ))}
          {reservaciones.length === 0 && (
            <div className="card text-center py-12">
              <CalendarDays
                size={40}
                className="mx-auto text-text-muted mb-3"
              />
              <p className="text-text-muted">Sin reservaciones</p>
            </div>
          )}
        </div>
        {deleteRes && (
          <ConfirmDeleteModal
            nombre={deleteRes.nombre}
            onConfirm={() => handleDelete(deleteRes.id)}
            onCancel={() => setDeleteRes(null)}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  nombre,
  onConfirm,
  onCancel,
}: {
  nombre: string;
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
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-danger/10">
            <AlertCircle size={20} className="text-danger" />
          </div>
          <h3 className="font-semibold text-text-primary">Eliminar reservación</h3>
        </div>
        <p className="text-sm text-text-muted">
          ¿Estás seguro de eliminar la reservación de <strong className="text-text-primary">{nombre}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
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
