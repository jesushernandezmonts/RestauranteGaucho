"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  CreditCard,
  Wallet,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  History,
  FileText,
} from "lucide-react";
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/lib/alerts";
import { ThermalTicketModal, ThermalTicketData } from "@/components/ThermalTicketModal";

type OrdenTurno = {
  id: number;
  total: number;
  propina: number;
  metodoPago: string;
  closedAt: string;
  mesero: { nombre: string };
};

type TurnoActual = {
  fechaInicio: string;
  ventasEfectivo: number;
  ventasTarjeta: number;
  totalVentas: number;
  totalPropinas: number;
  totalOrdenes: number;
  ordenes: OrdenTurno[];
};

type CorteHistorial = {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  totalVentas: number;
  totalPropinas: number;
  efectivoReal: number;
  diferencia: number;
  notas: string;
  createdAt: string;
  usuario: { nombre: string };
};

export default function CorteCajaSection() {
  const [loading, setLoading] = useState(true);
  const [turno, setTurno] = useState<TurnoActual | null>(null);
  const [historial, setHistorial] = useState<CorteHistorial[]>([]);

  // Form inputs para el nuevo corte
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [efectivoReal, setEfectivoReal] = useState<number>(0);
  const [notas, setNotas] = useState<string>("");
  const [procesando, setProcesando] = useState(false);

  // Thermal print modal state
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState<ThermalTicketData>({});

  const loadCorteData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/corte-caja");
      if (res.ok) {
        const data = await res.json();
        setTurno(data.turnoActual);
        setHistorial(data.historialCortes);
      }
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", "No se pudieron cargar los datos del turno.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCorteData();
  }, [loadCorteData]);

  const efectivoEsperado = (montoInicial || 0) + (turno?.ventasEfectivo || 0);
  const diferencia = (efectivoReal || 0) - efectivoEsperado;

  const handleCerrarCaja = async () => {
    if (!turno) return;

    const confirmed = await showConfirmAlert(
      "¿Realizar Corte Z y Cerrar Caja?",
      `Se registrará un cierre de turno con un total de $${turno.totalVentas.toFixed(
        2
      )} en ventas y una diferencia en efectivo de $${diferencia.toFixed(2)}.`,
      "Sí, Cerrar Caja"
    );

    if (!confirmed) return;

    try {
      setProcesando(true);
      const res = await fetch("/api/corte-caja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montoInicial,
          efectivoReal,
          notas,
        }),
      });

      if (res.ok) {
        const nuevoCorte = await res.json();
        showSuccessAlert("Caja Cerrada", "Corte Z registrado exitosamente.");

        // Abrir modal de ticket de corte Z recién generado
        setTicketData({
          corteId: nuevoCorte.id,
          adminNombre: nuevoCorte.usuario?.nombre,
          fechaInicio: nuevoCorte.fechaInicio,
          fechaFin: nuevoCorte.fechaFin,
          montoInicial: nuevoCorte.montoInicial,
          ventasEfectivo: nuevoCorte.ventasEfectivo,
          ventasTarjeta: nuevoCorte.ventasTarjeta,
          totalVentas: nuevoCorte.totalVentas,
          totalPropinas: nuevoCorte.totalPropinas,
          efectivoReal: nuevoCorte.efectivoReal,
          diferencia: nuevoCorte.diferencia,
          notas: nuevoCorte.notas,
        });
        setTicketModalOpen(true);

        // Reset inputs & reload
        setMontoInicial(0);
        setEfectivoReal(0);
        setNotas("");
        loadCorteData();
      } else {
        const errorData = await res.json();
        showErrorAlert("Error", errorData.error || "No se pudo realizar el corte.");
      }
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", "Ocurrió un error inesperado al procesar el corte.");
    } finally {
      setProcesando(false);
    }
  };

  const openTicketHistorial = (corte: CorteHistorial) => {
    setTicketData({
      corteId: corte.id,
      adminNombre: corte.usuario?.nombre,
      fechaInicio: corte.fechaInicio,
      fechaFin: corte.fechaFin,
      montoInicial: corte.montoInicial,
      ventasEfectivo: corte.ventasEfectivo,
      ventasTarjeta: corte.ventasTarjeta,
      totalVentas: corte.totalVentas,
      totalPropinas: corte.totalPropinas,
      efectivoReal: corte.efectivoReal,
      diferencia: corte.diferencia,
      notas: corte.notas,
    });
    setTicketModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-7 h-7 text-amber-500" /> Corte de Caja (Corte Z)
          </h2>
          <p className="text-sm text-stone-400">
            Arqueo de dinero en efectivo, ventas acumuladas e historial de cierres de turno.
          </p>
        </div>
        <button
          onClick={loadCorteData}
          className="self-start md:self-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition flex items-center gap-2"
        >
          <Clock className="w-4 h-4 text-amber-500" /> Actualizar Datos
        </button>
      </div>

      {/* METRICAS DEL TURNO ACTUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-400">Total Ventas</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            ${(turno?.totalVentas || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-500 mt-1">{turno?.totalOrdenes || 0} órdenes cerradas</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-400">Ventas en Efectivo</span>
            <Wallet className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            ${(turno?.ventasEfectivo || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-500 mt-1">Efectivo cobrado en turno</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-400">Ventas en Tarjeta</span>
            <CreditCard className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400 mt-2">
            ${(turno?.ventasTarjeta || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-500 mt-1">Terminales / Transferencias</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-400">Propinas Acumuladas</span>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            ${(turno?.totalPropinas || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-500 mt-1">Total abonado por clientes</p>
        </div>
      </div>

      {/* FORMULARIO DE CONTEO FISICO Y CORTE */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-500" /> Formulario de Arqueo de Caja
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fondo Inicial */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Fondo Inicial en Caja ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montoInicial || ""}
              onChange={(e) => setMontoInicial(parseFloat(e.target.value) || 0)}
              placeholder="Ej. 1000.00"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition font-mono"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Efectivo al abrir la caja
            </span>
          </div>

          {/* Conteo Real en Caja */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Efectivo Físico Contado ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={efectivoReal || ""}
              onChange={(e) => setEfectivoReal(parseFloat(e.target.value) || 0)}
              placeholder="Ej. 3500.00"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition font-mono text-lg font-bold"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Contar billetes y monedas en gaveta
            </span>
          </div>

          {/* Cálculo de Diferencia */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-xs uppercase text-stone-400 font-semibold">
              Balance y Diferencia
            </span>
            <div className="flex justify-between text-xs text-stone-300 mt-2">
              <span>Esperado (Fondo + Efectivo):</span>
              <span className="font-bold text-white">${efectivoEsperado.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black border-t border-stone-800 pt-2 mt-2">
              <span>Diferencia:</span>
              <span
                className={`text-lg font-black ${
                  diferencia < 0
                    ? "text-red-400"
                    : diferencia > 0
                    ? "text-emerald-400"
                    : "text-stone-300"
                }`}
              >
                {diferencia > 0 ? "+" : ""}${diferencia.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notas u Observaciones */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-stone-300 mb-2">
            Notas u Observaciones del Turno
          </label>

          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej. Sobrante por cambio exacto, faltante en propinas, etc."
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Botón de Generar Corte Z */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCerrarCaja}
            disabled={procesando}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 font-bold text-stone-950 rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50 text-sm"
          >
            {procesando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Receipt className="w-5 h-5" />
            )}
            Generar Corte Z y Cerrar Turno
          </button>
        </div>
      </div>

      {/* HISTORIAL DE CORTES Z ANTERIORES */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" /> Historial de Cortes de Caja
        </h3>

        {historial.length === 0 ? (
          <p className="text-stone-500 text-sm text-center py-6">
            No se han registrado cortes de caja anteriormente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Fecha Fin</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3 text-right">Ventas Total</th>
                  <th className="px-4 py-3 text-right">Efectivo Real</th>
                  <th className="px-4 py-3 text-right">Diferencia</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {historial.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-800/50 transition">
                    <td className="px-4 py-3 text-xs font-medium text-white">
                      {new Date(c.fechaFin).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.usuario?.nombre}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      ${c.totalVentas.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-300">
                      ${c.efectivoReal.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold font-mono ${
                        c.diferencia < 0
                          ? "text-red-400"
                          : c.diferencia > 0
                          ? "text-emerald-400"
                          : "text-stone-400"
                      }`}
                    >
                      {c.diferencia > 0 ? "+" : ""}${c.diferencia.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openTicketHistorial(c)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-500" /> Imprimir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE IMPRESIÓN TÉRMICA */}
      <ThermalTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        type="corte"
        data={ticketData}
      />
    </div>
  );
}
