"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, DollarSign } from "lucide-react";

type Orden = {
  id: number;
  mesaId: number;
  mesero: { id: number; nombre: string };
  total: number;
  propina: number;
  created_at: string;
  estado: string;
};

export default function ReportesSection() {
  const [loading, setLoading] = useState(true);
  const [meseros, setMeseros] = useState<
    { nombre: string; ordenes: number; ventas: number; propinas: number }[]
  >([]);

  async function loadReportes() {
    try {
      const res = await fetch("/api/ordenes");
      const ordenes: Orden[] = await res.json();

      const map = new Map<
        string,
        { nombre: string; ordenes: number; ventas: number; propinas: number }
      >();

      ordenes.forEach((orden) => {
        if (!orden.mesero?.nombre) return;
        const entry = map.get(orden.mesero.nombre) || {
          nombre: orden.mesero.nombre,
          ordenes: 0,
          ventas: 0,
          propinas: 0,
        };
        entry.ordenes++;
        entry.ventas += orden.total || 0;
        entry.propinas += orden.propina || 0;
        map.set(orden.mesero.nombre, entry);
      });

      setMeseros(
        Array.from(map.values()).sort((a, b) => b.ventas - a.ventas)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReportes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const totalVentas = meseros.reduce((s, m) => s + m.ventas, 0);
  const totalPropinas = meseros.reduce((s, m) => s + m.propinas, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Reportes
            </h1>
            <p className="text-sm text-text-muted">
              Rendimiento de meseros
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Users size={18} className="text-primary-light" />
              <span className="text-sm text-text-muted">Meseros</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {meseros.length}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={18} className="text-success" />
              <span className="text-sm text-text-muted">Total Ventas</span>
            </div>
            <div className="text-2xl font-bold text-success">
              ${totalVentas.toFixed(0)}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={18} className="text-warning" />
              <span className="text-sm text-text-muted">Total Propinas</span>
            </div>
            <div className="text-2xl font-bold text-warning">
              ${totalPropinas.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Mesero
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Órdenes
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Ventas
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Propinas
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {meseros.map((mesero, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-surface-light/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {mesero.nombre}
                      </span>
                      {idx === 0 && <span className="text-xs">🥇</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-text-secondary">
                    {mesero.ordenes}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                    ${mesero.ventas.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-warning">
                    ${mesero.propinas.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gradient">
                    ${(mesero.ventas + mesero.propinas).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
