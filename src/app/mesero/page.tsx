"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  User,
  Loader2,
  UtensilsCrossed,
  Bell,
  Clock,
  Users,
  ArrowRightLeft,
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
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/alerts";

type MesaEstado = "LIBRE" | "OCUPADO" | "CUENTA";
type Mesa = {
  id: number;
  numero: number;
  capacidad: number;
  area: string;
  estado: MesaEstado;
  updatedAt: string;
};

type OrdenLista = {
  id: number;
  mesaNumero: number;
  createdAt: string;
};

const statusConfig: Record<
  MesaEstado,
  { label: string; emoji: string; border: string; bg: string; text: string; dot: string }
> = {
  LIBRE: {
    label: "Libre",
    emoji: "🟢",
    border: "border-success/40",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  OCUPADO: {
    label: "Ocupado",
    emoji: "🟡",
    border: "border-warning/40",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  CUENTA: {
    label: "Cuenta",
    emoji: "🔴",
    border: "border-danger/40",
    bg: "bg-danger/10",
    text: "text-danger",
    dot: "bg-danger",
  },
};

function getOccupationTime(updatedAt: string): string {
  const now = Date.now();
  const updated = new Date(updatedAt).getTime();
  const diffMs = now - updated;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours < 1) return `${mins} min`;
  return `${hours}h ${remainingMins}m`;
}

export default function MeseroDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordenesListas, setOrdenesListas] = useState<OrdenLista[]>([]);
  const prevListasRef = useRef(0);
  const mountedRef = useRef(true);
  const { toasts, addToast, dismiss } = useToasts();
  const [notifyGranted, setNotifyGranted] = useState(false);
  const [showInstallTip, setShowInstallTip] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [filterArea, setFilterArea] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isDesktop, setIsDesktop] = useState(false);

  // Transfer table states
  const [transferOriginMesa, setTransferOriginMesa] = useState<Mesa | null>(null);
  const [destMesaId, setDestMesaId] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);

  // Detect desktop for grid positioning
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Update "now" every 30s to refresh occupation times
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/mesero/login");
    }
  }, [status, router]);

  // Pedir permiso de notificaciones al montar (solo funciona si hubo interacción)
  useEffect(() => {
    const checkNotify = async () => {
      if (canNotify()) {
        setNotifyGranted(true);
      }
      const subscribed = await isPushSubscribed();
      setPushSubscribed(subscribed);
      if (isMobile() && !isAppInstalled()) {
        setShowInstallTip(true);
      }
    };
    checkNotify();
  }, []);

  async function fetchOrdenesListas() {
    try {
      const res = await fetch("/api/ordenes?estado=LISTO&forKitchen=true");
      if (!res.ok) return;
      const data = await res.json();
      if (!mountedRef.current) return;

      const listas = data.map(
        (o: { id: number; mesa: { numero: number }; createdAt: string }) => ({
          id: o.id,
          mesaNumero: o.mesa.numero,
          createdAt: o.createdAt,
        })
      );

      // Detectar si hay nuevas órdenes listas
      if (listas.length > prevListasRef.current && prevListasRef.current !== 0) {
        const nuevas = listas.slice(0, listas.length - prevListasRef.current);
        playNotificationSound();
        for (const orden of nuevas.slice(0, 2)) {
          addToast({
            type: "success",
            title: "Orden lista",
            message: `Mesa ${orden.mesaNumero} — ¡Listo para servir!`,
            icon: "✅",
          });
        }
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

  useEffect(() => {
    fetchMesas();
    fetchOrdenesListas();

    const interval = setInterval(() => {
      fetchMesas();
      fetchOrdenesListas();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleMesaEstado(mesa: Mesa) {
    const nextEstado: Record<MesaEstado, MesaEstado> = {
      LIBRE: "OCUPADO",
      OCUPADO: "CUENTA",
      CUENTA: "LIBRE",
    };

    let confirmMsg = "";
    if (mesa.estado === "LIBRE") confirmMsg = `¿Abrir la Mesa ${mesa.numero}?`;
    if (mesa.estado === "OCUPADO") confirmMsg = `¿Pedir la cuenta para la Mesa ${mesa.numero}?`;
    if (mesa.estado === "CUENTA") confirmMsg = `¿Liberar la Mesa ${mesa.numero}?`;

    const confirmed = await showConfirmAlert("Mesa " + mesa.numero, confirmMsg, "Sí, confirmar");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/mesas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mesa.id, estado: nextEstado[mesa.estado] }),
      });
      if (!res.ok) {
        showErrorAlert("Error", "No se pudo actualizar la mesa.");
        throw new Error("Error al actualizar mesa");
      }
      fetchMesas();
      showSuccessAlert("Actualizada", "El estado de la mesa fue actualizado.");
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", "Ocurrió un error de red.");
    }
  }

  // ─── Derived state ──────────────────────────────────────

  const stats = useMemo(() => {
    const libres = mesas.filter((m) => m.estado === "LIBRE").length;
    const ocupadas = mesas.filter((m) => m.estado === "OCUPADO").length;
    const cuentas = mesas.filter((m) => m.estado === "CUENTA").length;
    return { libres, ocupadas, cuentas, total: mesas.length };
  }, [mesas]);

  const mesasConListas = useMemo(() => {
    return new Set(ordenesListas.map((o) => o.mesaNumero));
  }, [ordenesListas]);

  const areaOrder = ["Interior", "Exterior", "Salón", "Terraza"];
  const areas = useMemo(() => {
    const unique = [...new Set(mesas.map((m) => m.area))];
    return unique.sort((a, b) => {
      const ia = areaOrder.indexOf(a);
      const ib = areaOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [mesas]);

  const filteredAreas = useMemo(() => {
    if (filterArea) return [filterArea];
    return areas;
  }, [filterArea, areas]);

  const areaIcons: Record<string, string> = {
    Exterior: "🌿",
    Interior: "🏠",
    Salón: "🏠",
    Terraza: "🌿",
  };

  // Position map matching the physical floor plan
  const mesaPositionMap: Record<number, { row: number; col: number }> = {
    // Interior
    1: { row: 3, col: 1 },
    2: { row: 2, col: 1 },
    3: { row: 1, col: 1 },
    4: { row: 1, col: 2 },
    5: { row: 2, col: 2 },
    // Exterior
    6: { row: 1, col: 1 },
    7: { row: 1, col: 2 },
    8: { row: 1, col: 3 },
    9: { row: 2, col: 1 },
    10: { row: 2, col: 2 },
    11: { row: 3, col: 2 },
    12: { row: 4, col: 2 },
    13: { row: 5, col: 2 },
    14: { row: 5, col: 3 },
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-section">
      {/* ─── Top bar ───────────────────────────────────── */}
      <div className="glass border-b border-primary/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="text-primary" size={20} />
            <div>
              <h1 className="font-display text-lg font-bold text-gradient">
                Niño Gaucho
              </h1>
              <p className="text-xs text-text-muted">Mesero</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón activar notificaciones */}
            {!pushSubscribed && (
              <button
                onClick={async () => {
                  const ok = await requestNotifyPermission();
                  if (ok) {
                    setNotifyGranted(true);
                    const subscribed = await subscribeToPush("MESERO", session?.user?.id);
                    setPushSubscribed(subscribed);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-info/20 text-info border border-info/30 hover:bg-info/30 transition-all"
              >
                <Bell size={16} />
                🔔 Activar notif.
              </button>
            )}
            {/* Badge de órdenes listas */}
            {ordenesListas.length > 0 && (
              <Link
                href={"/mesero"}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-success/20 border border-success/30 text-success text-sm font-medium animate-pulse-soft"
              >
                <Bell size={16} />
                <span>
                  {ordenesListas.length} lista
                  {ordenesListas.length > 1 ? "s" : ""}
                </span>
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

      {/* MODAL MOVER / JUNTAR MESAS */}
      {transferOriginMesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="font-bold text-lg mb-2 text-amber-400 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Mover / Juntar Mesa #{transferOriginMesa.numero}
            </h3>
            <p className="text-xs text-stone-300 mb-4">
              Selecciona la mesa de destino. Si la mesa destino está ocupada, los consumos se <b>fusionarán</b> automáticamente.
            </p>

            <div className="grid grid-cols-4 gap-2 my-4 max-h-48 overflow-y-auto pr-1">
              {mesas
                .filter((m) => m.id !== transferOriginMesa.id)
                .sort((a, b) => a.numero - b.numero)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDestMesaId(m.id)}
                    className={`p-3 rounded-xl border text-center font-bold transition ${
                      destMesaId === m.id
                        ? "bg-amber-500 text-stone-950 border-amber-400 scale-105"
                        : m.estado === "LIBRE"
                        ? "bg-stone-950/60 border-emerald-500/40 text-emerald-400 hover:border-emerald-400"
                        : "bg-stone-950/60 border-amber-500/40 text-amber-400 hover:border-amber-400"
                    }`}
                  >
                    M{m.numero}
                    <span className="block text-[9px] font-normal opacity-80">
                      {m.estado === "LIBRE" ? "Libre" : "Ocupada"}
                    </span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  setTransferOriginMesa(null);
                  setDestMesaId(null);
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!destMesaId) return;
                  try {
                    setTransferring(true);
                    const res = await fetch("/api/mesas/transferir", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        origenMesaId: transferOriginMesa.id,
                        destinoMesaId: destMesaId,
                      }),
                    });

                    if (res.ok) {
                      const data = await res.json();
                      showSuccessAlert("Exitoso", data.message);
                      setTransferOriginMesa(null);
                      setDestMesaId(null);
                      fetchMesas();
                    } else {
                      const err = await res.json();
                      showErrorAlert("Error", err.error || "No se pudo transferir");
                    }
                  } catch (e) {
                    console.error(e);
                    showErrorAlert("Error", "Error al transferir la mesa");
                  } finally {
                    setTransferring(false);
                  }
                }}
                disabled={!destMesaId || transferring}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-stone-950 text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {transferring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4" />
                )}
                Confirmar Transferencia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Content ───────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Tip para instalar app en móvil */}
        {showInstallTip && (
          <div className="p-4 rounded-xl bg-info/10 border border-info/20 flex items-start gap-3">
            <span className="text-xl mt-0.5">📱</span>
            <div className="flex-1 text-sm text-info">
              <p className="font-medium mb-1">
                Instala la app para recibir notificaciones
              </p>
              <p className="opacity-80">
                En Chrome: Menú ⋮ → &quot;Instalar app&quot; o &quot;Agregar a
                pantalla de inicio&quot;
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

        {/* ─── Stats bar ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-success/10 border border-success/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-success/70 font-medium uppercase tracking-wide">
                Libres
              </p>
              <p className="text-2xl font-bold text-success mt-0.5">
                {stats.libres}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success text-xl">
              🟢
            </div>
          </div>
          <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-warning/70 font-medium uppercase tracking-wide">
                Ocupadas
              </p>
              <p className="text-2xl font-bold text-warning mt-0.5">
                {stats.ocupadas}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning text-xl">
              🟡
            </div>
          </div>
          <div className="rounded-2xl bg-danger/10 border border-danger/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-danger/70 font-medium uppercase tracking-wide">
                Cuenta
              </p>
              <p className="text-2xl font-bold text-danger mt-0.5">
                {stats.cuentas}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center text-danger text-xl">
              🔴
            </div>
          </div>
        </div>

        {/* ─── Filter pills ─────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterArea(null)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border ${
              filterArea === null
                ? "bg-primary/20 text-primary-light border-primary/40"
                : "bg-surface-light text-text-secondary border-primary/10 hover:border-primary/30"
            }`}
          >
            🗂️ Todas
          </button>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setFilterArea(area)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border ${
                filterArea === area
                  ? "bg-primary/20 text-primary-light border-primary/40"
                  : "bg-surface-light text-text-secondary border-primary/10 hover:border-primary/30"
              }`}
            >
              <span>{areaIcons[area] || "📍"}</span>
              {area}
            </button>
          ))}
        </div>

        {/* ─── Floor plan ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAreas.map((area) => {
            const mesasArea = mesas
              .filter((m) => m.area === area)
              .sort((a, b) => a.numero - b.numero);

            return (
              <div
                key={area}
                className="relative overflow-hidden rounded-3xl border border-primary/10 bg-[#1A1410]"
              >
                {/* Floor pattern subtle grid */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(232,171,47,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,171,47,0.3) 1px, transparent 1px)',
                    backgroundSize: "48px 48px",
                  }}
                />

                {/* Area header */}
                <div className="relative z-10 flex items-center gap-2 px-5 pt-4 pb-2">
                  <span className="text-lg">{areaIcons[area] || "📍"}</span>
                  <h2 className="font-display text-base font-bold text-white">
                    {area}
                  </h2>
                  <span className="text-xs text-text-muted ml-auto">
                    {mesasArea.length} mesas
                  </span>
                </div>

                {/* Tables grid */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 px-5 pb-5">
                  {mesasArea.map((mesa) => {
                    const cfg = statusConfig[mesa.estado];
                    const tieneLista = mesasConListas.has(mesa.numero);
                    const showTime =
                      mesa.estado === "OCUPADO" || mesa.estado === "CUENTA";

                    return (
                      <div
                        key={mesa.id}
                        className="relative group"
                        style={isDesktop && mesaPositionMap[mesa.numero] ? {
                          gridRow: mesaPositionMap[mesa.numero].row,
                          gridColumn: mesaPositionMap[mesa.numero].col,
                        } : {}}
                      >
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
                          className={`
                            relative block rounded-2xl border-2 p-4 text-center
                            transition-all duration-200
                            ${cfg.bg} ${cfg.border}
                            hover:scale-[1.02] active:scale-[0.98]
                            ${tieneLista ? "animate-pulse-border" : ""}
                          `}
                        >
                          {/* Ready badge */}
                          {tieneLista && (
                            <div className="absolute -top-2.5 -right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-success text-[10px] font-bold text-white shadow-lg shadow-success/30 animate-pulse-soft">
                              <span>✅</span>
                              <span>Listo</span>
                            </div>
                          )}

                          {/* Table number */}
                          <div className="text-xl font-bold text-white leading-none mb-1.5">
                            M{mesa.numero}
                          </div>

                          {/* Capacity */}
                          <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-2">
                            <Users size={12} />
                            <span>{mesa.capacidad} p.</span>
                          </div>

                          {/* Status badge */}
                          <div
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.text} bg-white/5 border ${cfg.border}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full ${cfg.dot}" />
                            {cfg.label}
                          </div>

                          {/* Occupation time & Transfer button */}
                          {showTime && (
                            <div className="mt-2 flex items-center justify-between gap-1 text-[10px] text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {getOccupationTime(mesa.updatedAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTransferOriginMesa(mesa);
                                  setDestMesaId(null);
                                }}
                                className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-0.5 font-bold"
                                title="Mover o Juntar Mesa"
                              >
                                <ArrowRightLeft size={10} />
                                Mover
                              </button>
                            </div>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Empty state for area */}
                {mesasArea.length === 0 && (
                  <div className="relative z-10 px-5 pb-8 text-center text-sm text-text-muted">
                    No hay mesas en esta área
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Legend ───────────────────────────────────── */}
        <div className="flex items-center justify-center gap-6 text-sm text-text-muted pt-2 pb-4">
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
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse-soft" />
            Listo ✅
          </span>
        </div>
      </div>

      {/* Toasts estilo WhatsApp */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
