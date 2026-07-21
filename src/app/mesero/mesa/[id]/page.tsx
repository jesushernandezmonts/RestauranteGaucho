"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  DollarSign,
  Edit2,
  Printer,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/alerts";
import { ThermalTicketModal, ThermalTicketData } from "@/components/ThermalTicketModal";

type Platillo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
};

type Categoria = {
  id: number;
  nombre: string;
  icono: string;
  platillos: Platillo[];
};

type ExtraItem = { nombre: string; precio: number };
type OpcionItem = { tipo: "QUITAR" | "NOTA"; valor: string };

type OrderItem = {
  platilloId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  extras: ExtraItem[];
  opciones: OpcionItem[];
  subtotal: number;
};


export default function MesaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const mesaId = parseInt(params.id);

  const [mesa, setMesa] = useState<{ numero: number; estado: string } | null>(null);
  const [menu, setMenu] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  // Order state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showCustomize, setShowCustomize] = useState<{
    platillo: Platillo;
    itemIndex: number | null;
    initialValues?: OrderItem;
  } | null>(null);
  const [sending, setSending] = useState(false);

  // New States
  const [showMobileTicket, setShowMobileTicket] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active Order & Thermal Print / Cancel States
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState<"comanda" | "cuenta">("comanda");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{ ordenId: number; detalleOrdenId?: number; platilloNombre?: string } | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [cancelando, setCancelando] = useState(false);

  async function loadData() {
    try {
      const [mesaRes, menuRes, ordenesRes] = await Promise.all([
        fetch(`/api/mesas`),
        fetch(`/api/platillos`),
        fetch(`/api/ordenes?mesaId=${mesaId}`),
      ]);
      const mesas = await mesaRes.json();
      const found = mesas.find((m: { id: number }) => m.id === mesaId);
      setMesa(found);
      const menuData = await menuRes.json();
      setMenu(menuData);

      const ordenesData = await ordenesRes.json();
      if (Array.isArray(ordenesData)) {
        const activa = ordenesData.find(
          (o: any) => o.mesaId === mesaId && o.estado !== "CERRADA" && o.estado !== "CANCELADA"
        );
        setActiveOrder(activa || null);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleProcesarCancelacion = async () => {
    if (!cancelTarget || !motivoCancelacion.trim()) {
      showErrorAlert("Motivo requerido", "Por favor ingresa un motivo para la cancelación.");
      return;
    }

    try {
      setCancelando(true);
      const res = await fetch("/api/ordenes/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordenId: cancelTarget.ordenId,
          detalleOrdenId: cancelTarget.detalleOrdenId,
          motivo: motivoCancelacion.trim(),
        }),
      });

      if (res.ok) {
        showSuccessAlert("Cancelado", "La cancelación fue procesada y los insumos reingresados.");
        setCancelModalOpen(false);
        setCancelTarget(null);
        setMotivoCancelacion("");
        loadData();
      } else {
        const err = await res.json();
        showErrorAlert("Error", err.error || "No se pudo procesar la cancelación.");
      }
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", "Error al procesar la cancelación.");
    } finally {
      setCancelando(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const quickAddToOrder = useCallback((platillo: Platillo) => {
    setOrderItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.platilloId === platillo.id &&
          item.extras.length === 0 &&
          item.opciones.length === 0
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newCantidad = item.cantidad + 1;
            return {
              ...item,
              cantidad: newCantidad,
              subtotal: item.precio * newCantidad,
            };
          }
          return item;
        });
      } else {
        return [
          ...prev,
          {
            platilloId: platillo.id,
            nombre: platillo.nombre,
            precio: platillo.precio,
            cantidad: 1,
            extras: [],
            opciones: [],
            subtotal: platillo.precio,
          },
        ];
      }
    });
  }, []);

  const quickRemoveFromOrder = useCallback((platilloId: number) => {
    setOrderItems((prev) => {
      let existingIndex = prev.findIndex(
        (item) =>
          item.platilloId === platilloId &&
          item.extras.length === 0 &&
          item.opciones.length === 0
      );
      if (existingIndex === -1) {
        existingIndex = prev.findLastIndex(
          (item) => item.platilloId === platilloId
        );
      }
      if (existingIndex === -1) return prev;

      const item = prev[existingIndex];
      if (item.cantidad > 1) {
        return prev.map((it, idx) => {
          if (idx === existingIndex) {
            const newCantidad = it.cantidad - 1;
            const extrasTotal = it.extras.reduce((s, e) => s + e.precio, 0);
            return {
              ...it,
              cantidad: newCantidad,
              subtotal: (it.precio + extrasTotal) * newCantidad,
            };
          }
          return it;
        });
      } else {
        return prev.filter((_, idx) => idx !== existingIndex);
      }
    });
  }, []);

  const editOrderItem = useCallback((index: number) => {
    const item = orderItems[index];
    const platillo = {
      id: item.platilloId,
      nombre: item.nombre,
      precio: item.precio,
      descripcion: "",
    };
    setShowCustomize({
      platillo,
      itemIndex: index,
      initialValues: item,
    });
  }, [orderItems]);

  const confirmCustomize = useCallback(
    (data: {
      cantidad: number;
      opciones: OpcionItem[];
      extras: ExtraItem[];
    }) => {
      if (!showCustomize) return;
      const { platillo, itemIndex } = showCustomize;
      const extrasTotal = data.extras.reduce((s, e) => s + e.precio, 0);
      const subtotal = (platillo.precio + extrasTotal) * data.cantidad;

      const newItem: OrderItem = {
        platilloId: platillo.id,
        nombre: platillo.nombre,
        precio: platillo.precio,
        cantidad: data.cantidad,
        extras: data.extras,
        opciones: data.opciones,
        subtotal,
      };

      if (itemIndex !== null) {
        setOrderItems((prev) =>
          prev.map((item, idx) => (idx === itemIndex ? newItem : item))
        );
      } else {
        setOrderItems((prev) => [...prev, newItem]);
      }
      setShowCustomize(null);
    },
    [showCustomize]
  );

  const removeItem = useCallback(async (index: number) => {
    const item = orderItems[index];
    const confirmed = await showConfirmAlert(
      "Quitar platillo",
      `¿Quitar ${item.nombre} de la orden?`,
      "Sí, quitar"
    );
    if (!confirmed) return;
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  }, [orderItems]);

  const sendToKitchen = useCallback(async () => {
    if (orderItems.length === 0 || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesaId,
          items: orderItems.map((item) => ({
            platilloId: item.platilloId,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
            extras: item.extras,
            opciones: item.opciones,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error al enviar orden");

      try {
        new BroadcastChannel("gaucho_ordenes_changes").postMessage("nueva_orden");
      } catch {}

      setOrderItems([]);
      setShowConfirmModal(false);
      setShowMobileTicket(false);
      showSuccessAlert("Orden enviada", "La comanda se envió a cocina.");
      router.push("/mesero");
    } catch (e) {
      console.error("Error sending order:", e);
      showErrorAlert("Error", "Error al enviar la orden a cocina");
    } finally {
      setSending(false);
    }
  }, [orderItems, mesaId, sending, router]);

  const total = orderItems.reduce((s, i) => s + i.subtotal, 0);

  const TicketContent = (
    <div className="flex flex-col h-full">
      {/* ORDEN ACTIVA YA ENVIADA */}
      {activeOrder && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Orden #{activeOrder.id} ({activeOrder.estado})
              </span>
              <p className="text-[11px] text-amber-200/70">
                {activeOrder.mesero?.nombre} — Total: ${activeOrder.total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => {
                setTicketType("comanda");
                setTicketModalOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg transition flex items-center gap-1"
            >
              <Printer size={13} /> Comanda
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {activeOrder.detalle?.map((d: any) => (
              <div
                key={d.id}
                className={`flex justify-between items-center text-xs p-1.5 rounded ${
                  d.cancelado ? "line-through opacity-50 bg-stone-900/50" : "bg-stone-950/40"
                }`}
              >
                <div>
                  <span className="font-bold">{d.cantidad}x </span>
                  <span>{d.platillo.nombre}</span>
                  {d.cancelado && <span className="ml-1 text-[10px] text-red-400">(CANCELADO)</span>}
                </div>
                {!d.cancelado && (
                  <button
                    onClick={() => {
                      setCancelTarget({
                        ordenId: activeOrder.id,
                        detalleOrdenId: d.id,
                        platilloNombre: d.platillo.nombre,
                      });
                      setMotivoCancelacion("");
                      setCancelModalOpen(true);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded transition"
                    title="Cancelar Platillo"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setCancelTarget({
                ordenId: activeOrder.id,
                platilloNombre: `Toda la Orden #${activeOrder.id}`,
              });
              setMotivoCancelacion("");
              setCancelModalOpen(true);
            }}
            className="mt-2 w-full text-center py-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition border border-red-500/20 rounded-lg"
          >
            Cancelar Orden Completa
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pb-3 border-b border-primary/10">
        <h2 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Pedido Adicional
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary-light font-semibold border border-primary/20">
          Mesa {mesa?.numero || params.id}
        </span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[250px] scrollbar-none">
        {orderItems.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-surface-light border border-primary/5 hover:border-primary/25 transition-all group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="text-xs text-primary-light font-medium">
                    ${item.subtotal}
                  </span>
                </div>

                {/* Extras & Options */}
                {(item.extras.length > 0 || item.opciones.length > 0) && (
                  <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-primary/20">
                    {item.extras.map((ext, i) => (
                      <div key={i} className="text-[11px] text-white/70 flex items-center gap-1">
                        <span className="text-primary-light">✚</span> {ext.nombre} (+${ext.precio})
                      </div>
                    ))}
                    {item.opciones.map((opc, i) => (
                      <div key={i} className={`text-[11px] flex items-center gap-1 ${opc.tipo === 'QUITAR' ? 'text-danger' : 'text-white/70'}`}>
                        <span>{opc.tipo === 'QUITAR' ? '❌' : '📝'}</span> {opc.valor}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editOrderItem(idx)}
                  className="p-1.5 rounded-lg hover:bg-primary/15 text-primary-light transition-colors cursor-pointer"
                  title="Personalizar"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => removeItem(idx)}
                  className="p-1.5 rounded-lg hover:bg-danger/10 text-danger/80 hover:text-danger transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {orderItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-white/30">
            <span className="text-3xl mb-2">🍽️</span>
            <p className="text-xs">Agrega platillos desde el menú</p>
          </div>
        )}
      </div>

      {/* Totals and Buttons */}
      <div className="pt-4 border-t border-primary/10 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Total Adicional:</span>
          <span className="text-xl font-bold text-gradient">${total.toFixed(0)}</span>
        </div>
        
        {orderItems.length > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-lg shadow-gold/20 cursor-pointer"
          >
            <Send size={16} /> Confirmar Orden
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-section pb-24 md:pb-8">
      {/* Header */}
      <div className="glass border-b border-primary/10 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-surface-light text-white transition-colors"
              aria-label="Regresar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">
                Mesa {mesa?.numero || params.id}
              </h1>
              <p className="text-xs text-white/60">
                Mesero: {session?.user?.nombre || ""}
              </p>
            </div>
          </div>
          {/* Cuenta button */}
          <Link
            href={`/mesero/cuenta/${mesaId}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm font-medium hover:bg-warning/20 transition-all"
          >
            <DollarSign size={16} />
            Cuenta
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Categories and Dishes */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            {/* Search */}
            <div className="relative sticky top-[73px] z-20 bg-stone-950/90 backdrop-blur-md pb-2 pt-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="🔍 Busca rápido: 'rib', 'coca', 'tacos'..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-surface border border-primary/20 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 transition-all text-sm shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick category nav - Sticky navigation */}
            {!search && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none sticky top-[125px] z-10 bg-stone-950/80 backdrop-blur-sm">
                <button
                  onClick={() => setExpandedCat(null)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                    expandedCat === null
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm"
                      : "bg-surface-light text-white/80 border-primary/10 hover:border-primary/30"
                  }`}
                >
                  🗂️ Todas
                </button>
                {menu.map((cat) => {
                  const catCount = orderItems.reduce((s, item) => {
                    const inCat = cat.platillos.some((p) => p.id === item.platilloId);
                    return inCat ? s + item.cantidad : s;
                  }, 0);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setExpandedCat(cat.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                        expandedCat === cat.id
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm"
                          : "bg-surface-light text-white/80 border-primary/10 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-sm">{cat.icono}</span>
                      {cat.nombre}
                      {catCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                          {catCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* BUSQUEDA INSTANTÁNEA - Lista plana directa si hay texto digitado */}
            {search.trim() !== "" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold px-1">
                  <span>Resultados de búsqueda</span>
                  <span>
                    {menu.flatMap((c) => c.platillos).filter(
                      (p) =>
                        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                        p.descripcion.toLowerCase().includes(search.toLowerCase())
                    ).length} encontrados
                  </span>
                </div>

                <div className="space-y-2">
                  {menu
                    .flatMap((c) => c.platillos)
                    .filter(
                      (p) =>
                        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                        p.descripcion.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((p) => {
                      const dishCount = orderItems
                        .filter((item) => item.platilloId === p.id)
                        .reduce((s, item) => s + item.cantidad, 0);

                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                            dishCount > 0
                              ? "bg-amber-500/10 border-amber-500/40 shadow-md"
                              : "bg-surface-light/80 border-white/5 hover:border-amber-500/30"
                          }`}
                        >
                          <button
                            onClick={() => setShowCustomize({ platillo: p, itemIndex: null })}
                            className="flex-1 min-w-0 pr-3 text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm hover:text-amber-400 transition-colors">
                                {p.nombre}
                              </span>
                              {dishCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-xs font-black">
                                  {dishCount}
                                </span>
                              )}
                            </div>
                            {p.descripcion && (
                              <p className="text-xs text-stone-400 mt-0.5 truncate">
                                {p.descripcion}
                              </p>
                            )}
                          </button>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-extrabold text-amber-400 text-base">
                              ${p.precio}
                            </span>
                            {dishCount > 0 ? (
                              <div className="flex items-center gap-2 bg-stone-900 border border-amber-500/30 rounded-xl p-1">
                                <button
                                  onClick={() => quickRemoveFromOrder(p.id)}
                                  className="w-9 h-9 rounded-lg bg-stone-800 text-amber-400 hover:bg-stone-700 active:scale-90 flex items-center justify-center font-bold text-lg transition-all"
                                  aria-label={`Disminuir ${p.nombre}`}
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="text-sm font-black text-white min-w-[20px] text-center">
                                  {dishCount}
                                </span>
                                <button
                                  onClick={() => quickAddToOrder(p)}
                                  className="w-9 h-9 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-90 flex items-center justify-center font-bold text-lg transition-all shadow-md shadow-amber-500/20"
                                  aria-label={`Aumentar ${p.nombre}`}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => quickAddToOrder(p)}
                                className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 flex items-center justify-center font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                                aria-label={`Agregar ${p.nombre} 1-Tap`}
                              >
                                <Plus size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {menu
                    .flatMap((c) => c.platillos)
                    .filter(
                      (p) =>
                        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                        p.descripcion.toLowerCase().includes(search.toLowerCase())
                    ).length === 0 && (
                    <div className="text-center py-10 bg-surface rounded-2xl border border-stone-800 text-stone-400">
                      <p className="text-sm">Sin platillos con "{search}"</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Menu por categorías normal */
              <div className="space-y-3">
                {menu.map((cat) => {
                  const isCatExpanded = expandedCat === null || expandedCat === cat.id;

                  const catOrderedCount = orderItems.reduce((s, item) => {
                    const inCat = cat.platillos.some((p) => p.id === item.platilloId);
                    return inCat ? s + item.cantidad : s;
                  }, 0);

                  return (
                    <div
                      key={cat.id}
                      className={`card !p-4 transition-all duration-200 ${
                        isCatExpanded ? "border-primary/20 shadow-sm shadow-primary/5" : ""
                      }`}
                    >
                      <button
                        onClick={() =>
                          setExpandedCat(expandedCat === cat.id ? null : cat.id)
                        }
                        className="w-full flex items-center justify-between text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icono}</span>
                          <h3 className="font-semibold text-white">
                            {cat.nombre}
                          </h3>
                          {catOrderedCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                              {catOrderedCount} en pedido
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">{cat.platillos.length} platillos</span>
                          {expandedCat === cat.id ? (
                            <ChevronUp size={18} className="text-primary-light" />
                          ) : (
                            <ChevronDown size={18} className="text-white/50" />
                          )}
                        </div>
                      </button>

                      {isCatExpanded && (
                        <div className="mt-4 space-y-2">
                          {cat.platillos.map((p) => {
                            const dishCount = orderItems
                              .filter((item) => item.platilloId === p.id)
                              .reduce((s, item) => s + item.cantidad, 0);
                            return (
                              <div
                                key={p.id}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all group border ${
                                  dishCount > 0
                                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                    : "bg-surface-light/40 border-transparent hover:bg-surface-light hover:border-primary/10"
                                }`}
                              >
                                <button
                                  onClick={() => setShowCustomize({ platillo: p, itemIndex: null })}
                                  className="flex-1 min-w-0 pr-3 text-left cursor-pointer group-hover:opacity-90"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white text-sm group-hover:text-primary-light transition-colors">{p.nombre}</span>
                                    {dishCount > 0 && (
                                      <span className="w-5 h-5 rounded-full bg-primary text-chocolate text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                        {dishCount}
                                      </span>
                                    )}
                                  </div>
                                  {p.descripcion && (
                                    <div className="text-xs text-white/60 mt-0.5 truncate">
                                      {p.descripcion}
                                    </div>
                                  )}
                                </button>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="font-bold text-primary-light text-sm whitespace-nowrap">
                                    ${p.precio}
                                  </span>
                                  {dishCount > 0 ? (
                                    <div className="flex items-center gap-1.5 bg-surface-light border border-primary/15 rounded-lg p-1">
                                      <button
                                        onClick={() => quickRemoveFromOrder(p.id)}
                                        className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary-light hover:bg-primary/25 active:scale-90 transition-all font-bold"
                                        aria-label={`Disminuir ${p.nombre}`}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="text-xs font-bold text-white min-w-[18px] text-center">
                                        {dishCount}
                                      </span>
                                      <button
                                        onClick={() => quickAddToOrder(p)}
                                        className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold hover:bg-amber-400 active:scale-90 transition-all"
                                        aria-label={`Aumentar ${p.nombre}`}
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => quickAddToOrder(p)}
                                      className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-stone-950 active:scale-95 transition-all cursor-pointer shadow-sm"
                                      aria-label={`Agregar ${p.nombre}`}
                                    >
                                      <Plus size={18} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Ticket (Desktop only, md and up) */}
          <div className="hidden md:block md:col-span-5 lg:col-span-4 sticky top-24 bg-surface rounded-2xl border border-primary/10 p-5 max-h-[calc(100vh-120px)] overflow-hidden">
            {TicketContent}
          </div>

        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-primary/10 animate-slide-up md:hidden z-40">
          <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2 scrollbar-none">
            {orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-light whitespace-nowrap flex-shrink-0"
              >
                <span className="w-4 h-4 rounded-full bg-primary text-chocolate text-[10px] font-bold flex items-center justify-center">
                  {item.cantidad}
                </span>
                <span className="font-medium text-white">{item.nombre}</span>
                <span className="text-white/60">${item.subtotal.toFixed(0)}</span>
                <button
                  onClick={() => removeItem(idx)}
                  className="ml-1 text-white/40 hover:text-danger transition-colors cursor-pointer"
                  aria-label={`Eliminar ${item.nombre}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 px-4 pb-4">
            <div>
              <div className="text-xs text-white/50">
                {orderItems.reduce((s, i) => s + i.cantidad, 0)} platillos
              </div>
              <div className="font-bold text-lg text-gradient">
                ${total.toFixed(0)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileTicket(true)}
                className="px-4 py-2.5 rounded-xl border border-primary/20 text-primary-light text-xs font-semibold hover:bg-primary/5 transition-all cursor-pointer"
              >
                Ver Comanda
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn-primary !px-5 !py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-pulse-soft"
              >
                <Send size={14} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Ticket Drawer */}
      {showMobileTicket && (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-end justify-center md:hidden animate-fade-in">
          <div className="w-full max-h-[85vh] bg-[#1A1410] border-t border-primary/20 rounded-t-3xl p-5 flex flex-col animate-slide-up z-50">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-primary/10">
              <h3 className="font-display text-lg font-bold text-white">Detalle de Comanda</h3>
              <button
                onClick={() => setShowMobileTicket(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-white/70 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {TicketContent}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Receipt Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#1A1410] border-2 border-primary/20 rounded-3xl p-6 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
            <div className="text-center pb-4 border-b border-primary/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📋</span>
              </div>
              <h3 className="font-display text-xl font-bold text-primary-light">Repetir Orden al Cliente</h3>
              <p className="text-xs text-white/50 mt-1">Lee los platillos al cliente para confirmar</p>
            </div>

            <div className="flex-1 overflow-y-auto my-4 py-3 px-3 border-2 border-dashed border-primary/15 rounded-2xl bg-black/30 font-mono text-sm leading-relaxed text-white space-y-4">
              <div className="text-center text-xs text-white/40 pb-2 border-b border-white/5">
                GAUCHO RESTAURANTE<br />
                Mesa: {mesa?.numero || params.id} — Mesero: {session?.user?.nombre || ""}<br />
                --------------------------------
              </div>
              
              <div className="space-y-3">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex justify-between font-bold">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>${item.subtotal}</span>
                    </div>
                    {item.extras.map((e, i) => (
                      <span key={i} className="text-xs text-white/70 pl-4">+ Extra: {e.nombre} (+${e.precio})</span>
                    ))}
                    {item.opciones.map((o, i) => (
                      <span key={i} className={`text-xs pl-4 ${o.tipo === 'QUITAR' ? 'text-danger' : 'text-white/70'}`}>
                        {o.tipo === 'QUITAR' ? '❌ Sin: ' : '📝 Nota: '}{o.valor}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 border-dashed text-right font-bold text-base text-primary-light">
                TOTAL: ${total.toFixed(0)}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={sendToKitchen}
                disabled={sending}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                {sending ? "Enviando comanda..." : "Confirmar y Enviar a Cocina"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Regresar a editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {showCustomize && (
        <CustomizeModal
          platillo={showCustomize.platillo}
          onConfirm={confirmCustomize}
          onCancel={() => setShowCustomize(null)}
          initialValues={showCustomize.initialValues}
        />
      )}

      {/* MODAL DE IMPRESIÓN TÉRMICA */}
      {activeOrder && (
        <ThermalTicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          type={ticketType}
          data={{
            ordenId: activeOrder.id,
            mesaNumero: mesa?.numero,
            meseroNombre: activeOrder.mesero?.nombre,
            fecha: activeOrder.createdAt,
            items: activeOrder.detalle?.map((d: any) => ({
              nombre: d.platillo.nombre,
              cantidad: d.cantidad,
              subtotal: d.subtotal,
              extras: d.extras,
              opciones: d.opciones,
            })),
            subtotal: activeOrder.total,
            total: activeOrder.total,
          }}
        />
      )}

      {/* MODAL DE JUSTIFICACIÓN DE CANCELACIÓN */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="font-bold text-lg mb-2 text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Cancelar {cancelTarget?.platilloNombre}
            </h3>
            <p className="text-xs text-stone-300 mb-4">
              Por favor ingresa el motivo de la cancelación para la bitácora de auditoría y retorno de insumos a almacén.
            </p>

            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Ej. Cliente cambió de opinión, error al capturar, platillo equivocado..."
              rows={3}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 mb-4 resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Regresar
              </button>
              <button
                onClick={handleProcesarCancelacion}
                disabled={cancelando || !motivoCancelacion.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancelando ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Customize Modal ────────────────────────────
function CustomizeModal({
  platillo,
  onConfirm,
  onCancel,
  initialValues,
}: {
  platillo: Platillo;
  onConfirm: (data: {
    cantidad: number;
    opciones: OpcionItem[];
    extras: ExtraItem[];
  }) => void;
  onCancel: () => void;
  initialValues?: OrderItem;
}) {
  const [cantidad, setCantidad] = useState(initialValues?.cantidad ?? 1);
  const [nota, setNota] = useState(
    initialValues?.opciones.find((o) => o.tipo === "NOTA")?.valor ?? ""
  );
  const [extras, setExtras] = useState<ExtraItem[]>(
    initialValues?.extras ?? []
  );
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");

  const extrasTotal = extras.reduce((s, e) => s + e.precio, 0);
  const subtotal = (platillo.precio + extrasTotal) * cantidad;

  const addExtra = () => {
    const name = extraName.trim();
    const price = parseFloat(extraPrice);
    if (!name || isNaN(price) || price < 0) return;
    setExtras((prev) => [...prev, { nombre: name, precio: price }]);
    setExtraName("");
    setExtraPrice("");
  };

  const removeExtra = (index: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const opciones: OpcionItem[] = [
      ...(nota ? [{ tipo: "NOTA" as const, valor: nota }] : []),
    ];
    onConfirm({ cantidad, opciones, extras });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl border border-primary/10 max-h-[90vh] overflow-y-auto animate-slide-up scrollbar-none">
        {/* Header */}
        <div className="sticky top-0 glass rounded-t-2xl p-4 border-b border-primary/10 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              ✏️ Personalizar
            </h2>
            <p className="text-sm text-white/80">
              {platillo.nombre} — ${platillo.precio}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-white/5 text-white/70 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Nota para cocina */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <span>📝</span> Nota para cocina
            </h3>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Término medio, sin sal, sin cebolla..."
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/30 transition-all text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Extras personalizados */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <span>➕</span> Extras
            </h3>
            {/* Lista de extras agregados */}
            {extras.length > 0 && (
              <div className="space-y-2 mb-3">
                {extras.map((ext, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/15 group">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-light text-xs">✚</span>
                      <span className="text-sm text-white font-medium">{ext.nombre}</span>
                      <span className="text-xs text-primary-light font-semibold">+${ext.precio}</span>
                    </div>
                    <button
                      onClick={() => removeExtra(i)}
                      className="p-1 rounded-lg hover:bg-danger/10 text-danger/70 hover:text-danger transition-colors cursor-pointer"
                      aria-label={`Eliminar extra ${ext.nombre}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Inputs para agregar extra */}
            <div className="flex gap-2">
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtra(); } }}
                placeholder="Nombre del extra"
                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-light border border-primary/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/30 transition-all text-sm"
              />
              <input
                type="number"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtra(); } }}
                placeholder="$0"
                min="0"
                step="1"
                className="w-20 px-3 py-2.5 rounded-xl bg-surface-light border border-primary/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/30 transition-all text-sm"
              />
              <button
                onClick={addExtra}
                disabled={!extraName.trim() || !extraPrice || parseFloat(extraPrice) < 0}
                className="px-3 py-2.5 rounded-xl bg-primary/15 border border-primary/25 text-primary-light text-sm font-semibold hover:bg-primary/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Agregar extra"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">
              Cantidad
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-10 h-10 rounded-xl bg-surface-light border border-primary/10 flex items-center justify-center text-white hover:bg-surface-lighter transition-all cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-10 h-10 rounded-xl bg-surface-light border border-primary/10 flex items-center justify-center text-white hover:bg-surface-lighter transition-all cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
            <span className="text-sm font-medium text-white">Subtotal</span>
            <span className="font-bold text-lg text-gradient">
              ${subtotal.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Confirm button */}
        <div className="sticky bottom-0 glass p-4 border-t border-primary/10 rounded-b-2xl">
          <button onClick={handleConfirm} className="btn-primary w-full text-base py-3.5 cursor-pointer">
            ✅ Actualizar Pedido — ${subtotal.toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
}
