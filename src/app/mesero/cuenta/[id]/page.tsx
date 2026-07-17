"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Wallet,
  Loader2,
  Printer,
  CheckCircle2,
  Percent,
  BanknoteIcon,
} from "lucide-react";

type Orden = {
  id: number;
  mesaId: number;
  total: number;
  propina: number;
  estado: string;
  createdAt: string;
  mesa: { numero: number };
  mesero: { nombre: string };
  detalle: {
    id: number;
    cantidad: number;
    subtotal: number;
    platillo: { nombre: string; precio: number };
    extras: { nombre: string; precio: number }[];
  }[];
};

export default function CuentaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const ordenId = parseInt(params.id);

  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "transferencia" | null>(null);
  const [tipoPropina, setTipoPropina] = useState<"cantidad" | "porcentaje">("porcentaje");
  const [propinaValor, setPropinaValor] = useState(0);
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(10);
  const [efectivoRecibido, setEfectivoRecibido] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const propinaPresets = [10, 15, 18, 20];

  async function loadOrden() {
    try {
      const res = await fetch(`/api/ordenes`);
      const ordenes = await res.json();
      // Buscar la orden activa (no cerrada) para esta mesa (ordenId aquí es en realidad params.id que es mesaId)
      const found = ordenes.find((o: any) => o.mesaId === ordenId && o.estado !== "CERRADA");
      if (found) setOrden(found);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrden();
  }, []);

  function getPropinaCalculada(): number {
    if (!orden) return 0;
    if (tipoPropina === "cantidad") return propinaValor;
    return (orden.total * propinaPorcentaje) / 100;
  }

  const propina = getPropinaCalculada();
  const totalConPropina = (orden?.total || 0) + propina;
  const cambio = efectivoRecibido - totalConPropina;

  async function handleCerrarCuenta() {
    if (!metodoPago || !orden) return;
    setProcesando(true);

    try {
      const res = await fetch("/api/ordenes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orden.id,
          estado: "CERRADA",
          metodoPago,
          total: orden.total,
          propina,
          tipoPropina,
          cerradaPor: session?.user?.id,
        }),
      });

      if (!res.ok) throw new Error("Error");

      // Liberar mesa
      await fetch("/api/mesas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orden.mesaId, estado: "LIBRE" }),
      });

      setCompletado(true);
    } catch (e) {
      console.error(e);
      alert("Error al cerrar la cuenta");
    } finally {
      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (completado) {
    return (
      <div className="min-h-screen dark-section flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
            ¡Cuenta Cerrada!
          </h2>
          <p className="text-text-secondary mb-2">
            Mesa {orden?.mesa.numero}
          </p>
          <div className="card mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">Total</span>
              <span className="font-bold text-text-primary">${orden?.total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">Propina</span>
              <span className="font-bold text-warning">+${propina.toFixed(0)}</span>
            </div>
            <div className="border-t border-primary/10 pt-2 flex justify-between">
              <span className="font-semibold">Total Pagado</span>
              <span className="font-bold text-lg text-gradient">${totalConPropina.toFixed(0)}</span>
            </div>
            <div className="mt-3 text-xs text-text-muted">
              Pagado con {metodoPago === "efectivo" ? "💵 Efectivo" : metodoPago === "transferencia" ? "📲 Transferencia" : "💳 Tarjeta"}
            </div>
          </div>
          <button
            onClick={() => router.push("/mesero")}
            className="btn-primary w-full"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-section">
      {/* Header */}
      <div className="glass border-b border-primary/10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-surface-light transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-gradient">
              Cuenta — Mesa {orden?.mesa.numero}
            </h1>
            <p className="text-xs text-text-muted">
              Atendida por {orden?.mesero.nombre}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-muted">Total</div>
            <div className="font-bold text-lg text-gradient">${totalConPropina.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Desglose por platillo */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            🧾 Desglose de la orden
          </h3>
          <div className="space-y-2">
            {orden?.detalle.map((det) => (
              <div key={det.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {det.cantidad}
                      </span>
                      <span className="text-text-primary font-medium">{det.platillo.nombre}</span>
                    </div>
                    {det.extras.length > 0 && (
                      <div className="ml-7 mt-0.5 space-y-0.5">
                        {det.extras.map((e, i) => (
                          <div key={i} className="flex justify-between text-xs text-text-muted">
                            <span>✚ {e.nombre}</span>
                            <span>+${e.precio}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-text-primary font-semibold ml-4">${det.subtotal.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-primary/10 mt-4 pt-3 flex justify-between font-bold">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">${orden?.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Propina */}

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-warning" />
            Propina
          </h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTipoPropina("porcentaje")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tipoPropina === "porcentaje"
                  ? "bg-primary/10 text-primary-light border border-primary/30"
                  : "bg-surface-light text-text-secondary border border-primary/10"
              }`}
            >
              <Percent size={14} className="inline mr-1" />
              Porcentaje
            </button>
            <button
              onClick={() => setTipoPropina("cantidad")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tipoPropina === "cantidad"
                  ? "bg-primary/10 text-primary-light border border-primary/30"
                  : "bg-surface-light text-text-secondary border border-primary/10"
              }`}
            >
              <BanknoteIcon size={14} className="inline mr-1" />
              Cantidad fija
            </button>
          </div>

          {tipoPropina === "porcentaje" ? (
            <div>
              <div className="flex gap-2 mb-3">
                {propinaPresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPropinaPorcentaje(p)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      propinaPorcentaje === p
                        ? "bg-warning/20 text-warning border border-warning/30"
                        : "bg-surface-light text-text-secondary border border-primary/10"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={propinaPorcentaje}
                onChange={(e) => setPropinaPorcentaje(parseInt(e.target.value))}
                className="w-full accent-warning"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>0%</span>
                <span className="font-medium text-warning">
                  {propinaPorcentaje}%
                </span>
                <span>30%</span>
              </div>
              {/* Custom percentage input */}
              <div className="mt-3">
                <label className="text-xs text-text-secondary mb-1.5 block">Porcentaje personalizado</label>
                <div className="relative max-w-[140px]">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={propinaPorcentaje}
                    onChange={(e) => setPropinaPorcentaje(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full pl-4 pr-8 py-2.5 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-warning/40 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm text-text-secondary mb-2 block">
                Cantidad de propina
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  value={propinaValor || ""}
                  onChange={(e) => setPropinaValor(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30"
                />
              </div>
            </div>
          )}
          <div className="mt-3 flex justify-between items-center p-3 rounded-xl bg-warning/10">
            <span className="text-sm text-text-secondary">Propina</span>
            <span className="font-bold text-warning">+${propina.toFixed(0)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">
            Método de Pago
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMetodoPago("efectivo")}
              className={`p-4 rounded-xl border text-center transition-all ${
                metodoPago === "efectivo"
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-surface-light border-primary/10 text-text-secondary hover:border-primary/30"
              }`}
            >
              <Wallet size={24} className="mx-auto mb-2" />
              <span className="text-xs font-medium">Efectivo</span>
            </button>
            <button
              onClick={() => setMetodoPago("tarjeta")}
              className={`p-4 rounded-xl border text-center transition-all ${
                metodoPago === "tarjeta"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-surface-light border-primary/10 text-text-secondary hover:border-primary/30"
              }`}
            >
              <CreditCard size={24} className="mx-auto mb-2" />
              <span className="text-xs font-medium">Tarjeta</span>
            </button>
            <button
              onClick={() => setMetodoPago("transferencia")}
              className={`p-4 rounded-xl border text-center transition-all ${
                metodoPago === "transferencia"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  : "bg-surface-light border-primary/10 text-text-secondary hover:border-primary/30"
              }`}
            >
              <BanknoteIcon size={24} className="mx-auto mb-2" />
              <span className="text-xs font-medium">Transferencia</span>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="card !p-0 overflow-hidden border-primary/20">
          <div className="bg-primary/10 px-5 py-4 space-y-2">
            <div className="flex justify-between text-sm items-center">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">${orden?.total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-text-secondary flex items-center gap-1">
                <span>Propina</span>
                {propina > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold">
                    {tipoPropina === "porcentaje" ? `${propinaPorcentaje}%` : "fija"}
                  </span>
                )}
              </span>
              <span className={propina > 0 ? "text-warning font-semibold" : "text-text-muted"}>
                {propina > 0 ? `+$${propina.toFixed(0)}` : "Sin propina"}
              </span>
            </div>
          </div>
          <div className="px-5 py-4 flex justify-between items-center">
            <span className="font-bold text-text-primary text-lg">Total a cobrar</span>
            <span className="font-bold text-2xl text-gradient">${totalConPropina.toFixed(0)}</span>
          </div>
        </div>

        {/* Info adicional por método de pago */}
        {metodoPago === "transferencia" && (
          <div className="card border-purple-500/20 bg-purple-500/5">
            <p className="text-sm text-purple-300 flex items-center gap-2">
              <span>📲</span>
              Solicita al cliente el comprobante de transferencia antes de cerrar la cuenta.
            </p>
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleCerrarCuenta}
          disabled={!metodoPago || procesando}
          className="btn-primary w-full text-base py-4 disabled:opacity-50"
        >
          {procesando ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <DollarSign size={20} />
          )}
          {procesando
            ? "Procesando..."
            : `Cobrar $${totalConPropina.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
}

