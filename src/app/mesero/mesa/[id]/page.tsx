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
} from "lucide-react";

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

const presetExtras = [
  { nombre: "Queso extra", precio: 20 },
  { nombre: "Aguacate", precio: 25 },
  { nombre: "Orden de papas", precio: 35 },
];

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
  } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [mesaRes, menuRes] = await Promise.all([
        fetch(`/api/mesas`),
        fetch(`/api/platillos`),
      ]);
      const mesas = await mesaRes.json();
      const found = mesas.find((m: { id: number }) => m.id === mesaId);
      setMesa(found);
      const menuData = await menuRes.json();
      setMenu(menuData);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  }

  const addToOrder = useCallback((platillo: Platillo) => {
    setShowCustomize({ platillo, itemIndex: null });
  }, []);

  const confirmCustomize = useCallback(
    (data: {
      cantidad: number;
      extras: ExtraItem[];
      opciones: OpcionItem[];
    }) => {
      if (!showCustomize) return;
      const { platillo } = showCustomize;
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

      setOrderItems((prev) => [...prev, newItem]);
      setShowCustomize(null);
    },
    [showCustomize]
  );

  const removeItem = useCallback((index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

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

      // Success - clear order and go back
      setOrderItems([]);
      router.push("/mesero");
    } catch (e) {
      console.error("Error sending order:", e);
      alert("Error al enviar la orden a cocina");
    } finally {
      setSending(false);
    }
  }, [orderItems, mesaId, sending, router]);

  const total = orderItems.reduce((s, i) => s + i.subtotal, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal pb-32">
      {/* Header */}
      <div className="glass border-b border-primary/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-surface-light transition-colors"
              aria-label="Regresar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">
                Mesa {mesa?.numero || params.id}
              </h1>
              <p className="text-xs text-text-muted">
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

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar platillo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>

        {/* Menu */}
        <div className="space-y-4">
          {menu
            .filter((cat) => {
              if (!search) return true;
              return cat.platillos.some(
                (p) =>
                  p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                  p.descripcion.toLowerCase().includes(search.toLowerCase())
              );
            })
            .map((cat) => {
              const filtered = search
                ? cat.platillos.filter(
                    (p) =>
                      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                      p.descripcion.toLowerCase().includes(search.toLowerCase())
                  )
                : cat.platillos;

              return (
                <div key={cat.id} className="card !p-4">
                  <button
                    onClick={() =>
                      setExpandedCat(expandedCat === cat.id ? null : cat.id)
                    }
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat.icono}</span>
                      <h3 className="font-semibold text-text-primary">
                        {cat.nombre}
                      </h3>
                    </div>
                    {expandedCat === cat.id ? (
                      <ChevronUp size={18} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-text-muted" />
                    )}
                  </button>

                  {expandedCat === cat.id && (
                    <div className="mt-4 space-y-2 animate-slide-down">
                      {filtered.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-medium text-text-primary text-sm">
                              {p.nombre}
                            </div>
                            {p.descripcion && (
                              <div className="text-xs text-text-muted truncate">
                                {p.descripcion}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary-light text-sm whitespace-nowrap">
                              ${p.precio}
                            </span>
                            <button
                              onClick={() => addToOrder(p)}
                              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-light hover:bg-primary/20 transition-all"
                              aria-label={`Agregar ${p.nombre}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <p className="text-sm text-text-muted text-center py-2">
                          Sin resultados
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <CustomizeModal
          platillo={showCustomize.platillo}
          onConfirm={confirmCustomize}
          onCancel={() => setShowCustomize(null)}
        />
      )}

      {/* Bottom Bar */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-primary/10 p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 overflow-x-auto pb-1">
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light/50 text-xs text-text-secondary whitespace-nowrap"
                  >
                    <span>
                      {item.nombre} x{item.cantidad}
                    </span>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-text-muted hover:text-danger transition-colors"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-text-muted">Total</div>
                <div className="font-bold text-lg text-gradient">
                  ${total.toFixed(0)}
                </div>
              </div>
              <button
                onClick={sendToKitchen}
                disabled={sending}
                className="btn-primary !px-6 !py-3 text-sm disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {sending ? "Enviando..." : "Enviar a Cocina"}
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
}: {
  platillo: Platillo;
  onConfirm: (data: {
    cantidad: number;
    extras: ExtraItem[];
    opciones: OpcionItem[];
  }) => void;
  onCancel: () => void;
}) {
  const [cantidad, setCantidad] = useState(1);
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [quitar, setQuitar] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [customExtra, setCustomExtra] = useState({ nombre: "", precio: 0 });

  const extrasTotal = extras.reduce((s, e) => s + e.precio, 0);
  const subtotal = (platillo.precio + extrasTotal) * cantidad;

  const addPresetExtra = (extra: { nombre: string; precio: number }) => {
    setExtras((prev) => [...prev, extra]);
  };

  const removeExtra = (idx: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCustomExtra = () => {
    if (!customExtra.nombre || customExtra.precio <= 0) return;
    setExtras((prev) => [...prev, { ...customExtra }]);
    setCustomExtra({ nombre: "", precio: 0 });
  };

  const toggleQuitar = (ing: string) => {
    setQuitar((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleConfirm = () => {
    const opciones: OpcionItem[] = [
      ...quitar.map((q) => ({ tipo: "QUITAR" as const, valor: q })),
      ...(nota ? [{ tipo: "NOTA" as const, valor: nota }] : []),
    ];
    onConfirm({ cantidad, extras, opciones });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl border border-primary/10 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 glass rounded-t-2xl p-4 border-b border-primary/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              ✏️ Personalizar
            </h2>
            <p className="text-sm text-text-secondary">
              {platillo.nombre} — ${platillo.precio}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-surface-light transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Quitar ingredientes */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <span className="text-danger">❌</span> Quitar ingredientes
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Sin papas", "Sin verduras", "Sin cebolla", "Sin sal", "Sin queso"].map(
                (ing) => (
                  <button
                    key={ing}
                    onClick={() => toggleQuitar(ing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      quitar.includes(ing)
                        ? "bg-danger/20 text-danger border-danger/30"
                        : "bg-surface-light text-text-secondary border-primary/10 hover:border-primary/30"
                    }`}
                  >
                    {quitar.includes(ing) ? "✓ " : ""}
                    {ing}
                  </button>
                )
              )}
              <input
                type="text"
                placeholder="Otro..."
                className="px-3 py-1.5 rounded-lg text-xs bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 max-w-[140px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    toggleQuitar(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>

          {/* Agregar extras */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <span className="text-primary-light">✚</span> Agregar extras
            </h3>
            <div className="space-y-2">
              {presetExtras.map((extra, idx) => {
                const alreadyAdded = extras.some(
                  (e) => e.nombre === extra.nombre
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50"
                  >
                    <span className="text-sm text-text-primary">
                      {extra.nombre}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-primary-light">
                        +${extra.precio}
                      </span>
                      {alreadyAdded ? (
                        <button
                          onClick={() =>
                            removeExtra(
                              extras.findIndex((e) => e.nombre === extra.nombre)
                            )
                          }
                          className="text-xs text-danger hover:bg-danger/10 px-2 py-1 rounded-lg transition-colors"
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          onClick={() => addPresetExtra(extra)}
                          className="text-xs text-primary-light hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom extra */}
            <div className="mt-3 p-3 rounded-xl bg-surface-light/50 border border-dashed border-primary/20">
              <h4 className="text-xs font-medium text-text-secondary mb-2">
                Extra personalizado
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre del extra"
                  value={customExtra.nombre}
                  onChange={(e) =>
                    setCustomExtra((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-surface text-xs text-text-primary border border-primary/10 placeholder:text-text-muted focus:outline-none focus:border-primary/30"
                />
                <span className="text-xs text-text-muted">$</span>
                <input
                  type="number"
                  placeholder="Precio"
                  value={customExtra.precio || ""}
                  onChange={(e) =>
                    setCustomExtra((prev) => ({
                      ...prev,
                      precio: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-20 px-3 py-2 rounded-lg bg-surface text-xs text-text-primary border border-primary/10 placeholder:text-text-muted focus:outline-none focus:border-primary/30"
                />
                <button
                  onClick={addCustomExtra}
                  disabled={!customExtra.nombre || customExtra.precio <= 0}
                  className="px-3 py-2 rounded-lg bg-primary/10 text-primary-light text-xs font-medium hover:bg-primary/20 disabled:opacity-50 transition-all"
                >
                  +Agregar
                </button>
              </div>
            </div>

            {/* Extra list */}
            {extras.length > 0 && (
              <div className="mt-3 space-y-1">
                {extras.map((extra, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs text-text-secondary"
                  >
                    <span>✚ {extra.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary-light">+${extra.precio}</span>
                      <button
                        onClick={() => removeExtra(idx)}
                        className="text-danger/60 hover:text-danger"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <span>📝</span> Nota para cocina
            </h3>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Término medio, sin sal..."
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 transition-all text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Cantidad */}
          <div>
            <h3 className="font-semibold text-text-primary text-sm mb-3">
              Cantidad
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-10 h-10 rounded-xl bg-surface-light border border-primary/10 flex items-center justify-center text-text-primary hover:bg-surface-lighter transition-all"
                aria-label="Disminuir cantidad"
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-bold text-text-primary w-8 text-center">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-10 h-10 rounded-xl bg-surface-light border border-primary/10 flex items-center justify-center text-text-primary hover:bg-surface-lighter transition-all"
                aria-label="Aumentar cantidad"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="font-bold text-lg text-gradient">
              ${subtotal.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Confirm button */}
        <div className="sticky bottom-0 glass p-4 border-t border-primary/10 rounded-b-2xl">
          <button onClick={handleConfirm} className="btn-primary w-full text-base py-3.5">
            ✅ Agregar al Pedido — ${subtotal.toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
}
