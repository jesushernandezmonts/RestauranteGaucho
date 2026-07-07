"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, CalendarDays } from "lucide-react";

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

export default function AdminReservacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch("/api/reservaciones");
      setReservaciones(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateEstado(id: number, estado: string) {
    await fetch("/api/reservaciones", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado }),
    });
    load();
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-charcoal"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-charcoal p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-light"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Reservaciones</h1>
            <p className="text-sm text-text-muted">Administrar reservas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reservaciones.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text-primary">{r.nombre}</h3>
                  <p className="text-xs text-text-muted">
                    {r.telefono && `📞 ${r.telefono}`} {r.email && `· ✉️ ${r.email}`}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoColors[r.estado] || "bg-surface-light text-text-muted"}`}>
                  {r.estado}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Fecha</div>
                  <div className="text-sm font-medium text-text-primary">{new Date(r.fecha).toLocaleDateString("es-MX")}</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Hora</div>
                  <div className="text-sm font-medium text-text-primary">{r.hora}</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-light/50">
                  <div className="text-xs text-text-muted">Personas</div>
                  <div className="text-sm font-medium text-text-primary">{r.personas}</div>
                </div>
              </div>
              {r.notas && <p className="text-sm text-text-muted mb-3">📝 {r.notas}</p>}
              <div className="flex gap-2">
                {r.estado === "pendiente" && (
                  <>
                    <button onClick={() => updateEstado(r.id, "confirmada")} className="px-4 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20">✅ Confirmar</button>
                    <button onClick={() => updateEstado(r.id, "cancelada")} className="px-4 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20">❌ Cancelar</button>
                  </>
                )}
                {r.estado === "confirmada" && <span className="text-xs text-text-muted">✅ Confirmada</span>}
              </div>
            </div>
          ))}
          {reservaciones.length === 0 && (
            <div className="card text-center py-12">
              <CalendarDays size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">Sin reservaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
