"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  LogOut,
  Loader2,
  Bell,
  RefreshCw,
  Clock,
  User,
} from "lucide-react";
import {
  playNotificationSound,
  showNotification,
  requestNotifyPermission,
  canNotify,
  isMobile,
  isAppInstalled,
} from "@/lib/notifications";
import { ToastContainer, useToasts } from "@/components/Toast";
import { subscribeToPush, isPushSubscribed } from "@/lib/pushClient";

type Orden = {
  id: number;
  mesaId: number;
  meseroId: number;
  estado: "EN_COCINA" | "PREPARANDO" | "LISTO" | "SERVIDO";
  total: number;
  createdAt: string;
  mesa: { numero: number };
  mesero: { id: number; nombre: string };
  detalle: {
    id: number;
    cantidad: number;
    platillo: { id: number; nombre: string };
    extras: { id: number; nombre: string; precio: number }[];
    opciones: { id: number; tipo: "QUITAR" | "NOTA"; valor: string }[];
  }[];
};

const stateColors = {
  EN_COCINA: {
    bg: "bg-warning/10 border-warning/30",
    dot: "bg-warning",
    label: "NUEVA",
    labelColor: "text-warning",
  },
  PREPARANDO: {
    bg: "bg-info/10 border-info/30",
    dot: "bg-info",
    label: "PREPARANDO",
    labelColor: "text-info",
  },
  LISTO: {
    bg: "bg-success/10 border-success/30",
    dot: "bg-success",
    label: "LISTO",
    labelColor: "text-success",
  },
  SERVIDO: {
    bg: "bg-text-muted/10 border-text-muted/30",
    dot: "bg-text-muted",
    label: "SERVIDO",
    labelColor: "text-text-muted",
  },
};

export default function CocinaDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const prevNuevasRef = useRef(0);
  const { toasts, addToast, dismiss } = useToasts();
  const [notifyGranted, setNotifyGranted] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/cocina/login");
  }, [status, router]);

  // Pedir permiso de notificaciones al montar (solo funciona si hubo interacción)
  useEffect(() => {
    const checkNotify = async () => {
      if (canNotify()) {
        setNotifyGranted(true);
      }
      // Check if already subscribed to push
      const subscribed = await isPushSubscribed();
      setPushSubscribed(subscribed);
      // En móvil mostrar sugerencia de instalar app si no está instalada
      if (isMobile() && !isAppInstalled()) {
        setShowInstallTip(true);
      }
    };
    checkNotify();
  }, []);

  const fetchOrdenes = useCallback(async () => {
    try {
      const res = await fetch("/api/ordenes?forKitchen=true", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as Orden[];
        const nuevas = data.filter((o) => o.estado === "EN_COCINA");

        // Detectar si llegaron nuevas órdenes
        if (nuevas.length > prevNuevasRef.current && prevNuevasRef.current !== 0) {
          const recienLlegadas = nuevas.slice(0, nuevas.length - prevNuevasRef.current);
          playNotificationSound();
          // Toast estilo WhatsApp
          for (const orden of recienLlegadas.slice(0, 2)) {
            addToast({
              type: "warning",
              title: "Nueva orden",
              message: `Mesa ${orden.mesa.numero} — ${orden.detalle.map((d) => `${d.cantidad}x ${d.platillo.nombre}`).join(", ")}`,
              icon: "🍳",
            });
          }
          // Notificación del sistema (para cuando están en otra pestaña)
          for (const orden of recienLlegadas.slice(0, 3)) {
            showNotification(
              "🍳 Nueva orden",
              `Mesa ${orden.mesa.numero} — ${orden.detalle.map((d) => `${d.cantidad}x ${d.platillo.nombre}`).join(", ")}`
            );
          }
        }
        prevNuevasRef.current = nuevas.length;

        setOrdenes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrdenes();

    // Cross-tab instant sync
    const channel = new BroadcastChannel("gaucho_ordenes_changes");
    channel.onmessage = () => fetchOrdenes();

    // Poll every 1s for near-instant toast updates
    const interval = setInterval(() => {
      fetchOrdenes();
      setNow(Date.now());
    }, 1000);

    return () => { channel.close(); clearInterval(interval); };
  }, [fetchOrdenes]);

  const updateEstado = useCallback(
    async (ordenId: number, nuevoEstado: string) => {
      try {
        const res = await fetch(`/api/ordenes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ordenId, estado: nuevoEstado }),
        });
        if (res.ok) fetchOrdenes();
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  function getTimeElapsed(createdAt: string) {
    const diff = now - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    return `${mins} min`;
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const nuevas = ordenes.filter((o) => o.estado === "EN_COCINA");
  const preparando = ordenes.filter((o) => o.estado === "PREPARANDO");
  const listas = ordenes.filter((o) => o.estado === "LISTO");

  return (
    <div className="min-h-screen dark-section" style={{ background: "#121212" }}>
      {/* Header */}
      <div className="glass border-b border-primary/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="text-primary" size={28} />
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">
                Cocina
              </h1>
              <p className="text-xs text-text-muted">
                {new Date().toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning" />
                {nuevas.length} nuevas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-info" />
                {preparando.length} en curso
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                {listas.length} listas
              </span>
            </div>
            <button
              onClick={fetchOrdenes}
              className="p-2 rounded-xl hover:bg-surface-light transition-colors"
              aria-label="Actualizar"
            >
              <RefreshCw size={18} className="text-text-muted" />
            </button>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User size={16} />
              <span className="text-text-primary">
                {session?.user?.nombre}
              </span>
            </div>
            {/* Botón activar notificaciones (solo si no están activas) */}
            {!pushSubscribed && (
              <button
                disabled={subscribing}
                onClick={async () => {
                  setSubscribing(true);
                  try {
                    const ok = await requestNotifyPermission();
                    if (ok) {
                      setNotifyGranted(true);
                      const subscribed = await subscribeToPush("CHEF", session?.user?.id);
                      setPushSubscribed(subscribed);
                    }
                  } finally {
                    setSubscribing(false);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-info/20 text-info border border-info/30 hover:bg-info/30 transition-all disabled:opacity-50"
              >
                <Bell size={16} />
                {subscribing ? "Suscribiendo..." : "🔔 Activar notif."}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/cocina/login" })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Kitchen Board */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Alert sound for new orders would go here */}
        {nuevas.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3 animate-pulse-soft">
            <Bell className="text-warning" size={20} />
            <span className="text-warning font-medium">
              ¡{nuevas.length} {nuevas.length === 1 ? "orden nueva" : "órdenes nuevas"}!
            </span>
          </div>
        )}

        {/* Tip para instalar app en móvil */}
        {showInstallTip && (
          <div className="mb-6 p-4 rounded-xl bg-info/10 border border-info/20 flex items-start gap-3">
            <span className="text-xl mt-0.5">📱</span>
            <div className="flex-1 text-sm text-info">
              <p className="font-medium mb-1">Instala la app para recibir notificaciones</p>
              <p className="opacity-80">
                En Chrome: Menú ⋮ → &quot;Instalar app&quot; o &quot;Agregar a pantalla de inicio&quot;
              </p>
            </div>
            <button
              onClick={() => setShowInstallTip(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NUEVAS Column */}
          <div>
            <h3 className="font-display text-lg font-bold text-warning mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning animate-pulse-soft" />
              NUEVAS ({nuevas.length})
            </h3>
            <div className="space-y-4">
              {nuevas.map((orden) => (
                <OrderCard
                  key={orden.id}
                  orden={orden}
                  timeElapsed={getTimeElapsed(orden.createdAt)}
                  onAction={() => updateEstado(orden.id, "PREPARANDO")}
                  actionLabel="🔴 Iniciar"
                  actionColor="bg-info/20 text-info hover:bg-info/30"
                />
              ))}
              {nuevas.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">
                  Sin órdenes nuevas
                </p>
              )}
            </div>
          </div>

          {/* PREPARANDO Column */}
          <div>
            <h3 className="font-display text-lg font-bold text-info mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-info" />
              EN COCINA ({preparando.length})
            </h3>
            <div className="space-y-4">
              {preparando.map((orden) => (
                <OrderCard
                  key={orden.id}
                  orden={orden}
                  timeElapsed={getTimeElapsed(orden.createdAt)}
                  onAction={() => updateEstado(orden.id, "LISTO")}
                  actionLabel="✅ Listo"
                  actionColor="bg-success/20 text-success hover:bg-success/30"
                />
              ))}
              {preparando.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">
                  Sin órdenes en preparación
                </p>
              )}
            </div>
          </div>

          {/* LISTO Column */}
          <div>
            <h3 className="font-display text-lg font-bold text-success mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              LISTO ({listas.length})
            </h3>
            <div className="space-y-4">
              {listas.map((orden) => (
                <OrderCard
                  key={orden.id}
                  orden={orden}
                  timeElapsed={getTimeElapsed(orden.createdAt)}
                  onAction={() => updateEstado(orden.id, "SERVIDO")}
                  actionLabel="🧹 Limpiar"
                  actionColor="bg-text-muted/20 text-text-muted hover:bg-text-muted/30"
                />
              ))}
              {listas.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">
                  Sin órdenes listas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toasts estilo WhatsApp */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ─── Order Card ────────────────────────────────
function OrderCard({
  orden,
  timeElapsed,
  onAction,
  actionLabel,
  actionColor,
}: {
  orden: Orden;
  timeElapsed: string;
  onAction: () => void;
  actionLabel: string;
  actionColor: string;
}) {
  return (
    <div
      className={`card !p-4 ${
        orden.estado === "EN_COCINA"
          ? "border-warning/30 animate-glow"
          : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary">
            Mesa {orden.mesa.numero}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-text-muted">
            {orden.mesero.nombre}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Clock size={12} />
          {timeElapsed}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {orden.detalle.map((det) => (
          <div key={det.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary-light font-medium">
                {det.cantidad}x
              </span>
              <span className="text-text-primary">{det.platillo.nombre}</span>
            </div>
            {/* Options */}
            {det.opciones.length > 0 && (
              <div className="ml-7 mt-1 space-y-0.5">
                {det.opciones
                  .filter((o) => o.tipo === "QUITAR")
                  .map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center gap-1 text-xs text-danger/80"
                    >
                      ❌ {o.valor}
                    </span>
                  ))}
                {det.opciones
                  .filter((o) => o.tipo === "NOTA")
                  .map((o) => (
                    <span
                      key={o.id}
                      className="block text-xs text-text-muted italic"
                    >
                      📝 {o.valor}
                    </span>
                  ))}
              </div>
            )}
            {/* Extras */}
            {det.extras.length > 0 && (
              <div className="ml-7 flex flex-wrap gap-1 mt-1">
                {det.extras.map((ex) => (
                  <span
                    key={ex.id}
                    className="inline-flex items-center gap-1 text-xs text-secondary"
                  >
                    ✚ {ex.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      <button onClick={onAction} className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${actionColor}`}>
        {actionLabel}
      </button>
    </div>
  );
}
