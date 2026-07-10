"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Loader2, UtensilsCrossed, Bell } from "lucide-react";
import {
  playNotificationSound,
  showNotification,
  requestNotifyPermission,
} from "@/lib/notifications";

type MesaEstado = "LIBRE" | "OCUPADO" | "CUENTA";
type Mesa = {
  id: number;
  numero: number;
  capacidad: number;
  area: string;
  estado: MesaEstado;
};

const statusColors: Record<MesaEstado, string> = {
  LIBRE: "bg-success/20 text-success border-success/30 hover:bg-success/30",
  OCUPADO: "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
  CUENTA: "bg-danger/20 text-danger border-danger/30 hover:bg-danger/30",
};

const statusLabels: Record<MesaEstado, string> = {
  LIBRE: "Libre",
  OCUPADO: "Ocupado",
  CUENTA: "Cuenta",
};

const statusEmojis: Record<MesaEstado, string> = {
  LIBRE: "🟢",
  OCUPADO: "🟡",
  CUENTA: "🔴",
};

export default function MeseroDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordenesListas, setOrdenesListas] = useState<
    { id: number; mesaNumero: number; createdAt: string }[]
  >([]);
  const prevListasRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/mesero/login");
      return;
    }
  }, [status, router]);

  // Pedir permiso de notificaciones al montar
  useEffect(() => {
    requestNotifyPermission();
  }, []);

  useEffect(() => {
    fetchMesas();
    fetchOrdenesListas();

    // Poll cada 4s
    const interval = setInterval(() => {
      fetchMesas();
      fetchOrdenesListas();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function fetchOrdenesListas() {
    try {
      const res = await fetch("/api/ordenes?estado=LISTO&forKitchen=true");
      if (!res.ok) return;
      const data = await res.json();

      if (!mountedRef.current) return;

      const listas = data.map((o: { id: number; mesa: { numero: number }; createdAt: string }) => ({
        id: o.id,
        mesaNumero: o.mesa.numero,
        createdAt: o.createdAt,
      }));

      // Detectar si hay nuevas órdenes listas
      if (listas.length > prevListasRef.current && prevListasRef.current !== 0) {
        const nuevas = listas.slice(0, listas.length - prevListasRef.current);
        playNotificationSound();
        for (const orden of nuevas.slice(0, 3)) {
          showNotification(
            "✅ Orden lista",
            `Mesa ${orden.mesaNumero} — ¡Listo para servir!`
          );
        }
      }
      prevListasRef.current = listas.length;

      setOrdenesListas(listas);
    } catch {
      // Silently fail
    }
  }

  async function fetchMesas() {
    try {
      const res = await fetch("/api/mesas");
      if (!res.ok) throw new Error("Error al cargar mesas");
      const data = await res.json();
      setMesas(data);
    } catch (e) {
      setError("Error al cargar las mesas");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMesaEstado(mesa: Mesa) {
    const nextEstado: Record<MesaEstado, MesaEstado> = {
      LIBRE: "OCUPADO",
      OCUPADO: "CUENTA",
      CUENTA: "LIBRE",
    };

    try {
      const res = await fetch("/api/mesas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mesa.id, estado: nextEstado[mesa.estado] }),
      });
      if (!res.ok) throw new Error("Error al actualizar mesa");
      fetchMesas();
    } catch (e) {
      console.error(e);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const areas = ["Exterior", "Interior"];

  return (
    <div className="min-h-screen dark-section">
      {/* Top bar */}
      <div className="glass border-b border-primary/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="text-primary" size={20} />
            <div>
              <h1 className="font-display text-lg font-bold text-gradient">
                Gaucho
              </h1>
              <p className="text-xs text-text-muted">Mesero</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge de órdenes listas */}
            {ordenesListas.length > 0 && (
              <Link
                href={"/mesero"}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-success/20 border border-success/30 text-success text-sm font-medium animate-pulse-soft"
              >
                <Bell size={16} />
                <span>{ordenesListas.length} lista{ordenesListas.length > 1 ? "s" : ""}</span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={14} />
              <span className="font-medium text-text-primary">
                {session?.user?.nombre || "Mesero"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/mesero/login" })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Mesa map */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => (
            <div key={area} className="card">
              <h3 className="font-display text-base font-bold text-text-primary mb-3">
                {area === "Exterior" ? "🌿" : "🏠"}
                {area}
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {mesas
                  .filter((m) => m.area === area)
                  .sort((a, b) => a.numero - b.numero)
                  .map((mesa) => (
                    <div key={mesa.id} className="relative group">
                      <Link
                        href={
                          mesa.estado !== "LIBRE"
                            ? `/mesero/mesa/${mesa.id}`
                            : "#"
                        }
                        onClick={(e) => {
                          if (mesa.estado === "LIBRE") {
                            e.preventDefault();
                            toggleMesaEstado(mesa);
                          }
                        }}
                        className={`block p-4 rounded-xl border text-center transition-all duration-200 ${
                          statusColors[mesa.estado]
                        }`}
                      >
                        <div className="text-xl mb-1">
                          M{mesa.numero}
                        </div>
                        <div className="text-xs opacity-75">
                          {statusEmojis[mesa.estado]} {statusLabels[mesa.estado]}
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            Libre
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            Ocupado
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger" />
            Cuenta
          </span>
        </div>
      </div>
    </div>
  );
}
