"use client";

import React from "react";
import { Printer, X } from "lucide-react";

export type ThermalTicketData = {
  // Para Ticket de Cuenta / Cliente
  ordenId?: number;
  mesaNumero?: number;
  meseroNombre?: string;
  fecha?: string;
  items?: {
    nombre: string;
    cantidad: number;
    subtotal: number;
    extras?: { nombre: string; precio: number }[];
    opciones?: { tipo: string; valor: string }[];
  }[];
  subtotal?: number;
  propina?: number;
  total?: number;
  metodoPago?: string;

  // Para Corte de Caja Z
  corteId?: number;
  adminNombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  montoInicial?: number;
  ventasEfectivo?: number;
  ventasTarjeta?: number;
  totalVentas?: number;
  totalPropinas?: number;
  efectivoReal?: number;
  diferencia?: number;
  notas?: string;
};

interface ThermalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "cuenta" | "comanda" | "corte";
  data: ThermalTicketData;
}

export function ThermalTicketModal({
  isOpen,
  onClose,
  type,
  data,
}: ThermalTicketModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const fechaFormateada = data.fecha
    ? new Date(data.fecha).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <div id="thermal-ticket-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Estilos específicos para impresión térmica en impresora de 58mm */}
      <style jsx global>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          html,
          body {
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          #thermal-ticket-modal-backdrop,
          #thermal-ticket-modal-box,
          #thermal-ticket-scroll-wrapper {
            position: static !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          #thermal-ticket-print-area,
          #thermal-ticket-print-area * {
            visibility: visible !important;
          }

          #thermal-ticket-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 54mm !important;
            max-width: 58mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            color: #000 !important;
            background: #fff !important;
            font-family: "Courier New", Courier, monospace !important;
            font-size: 9.5pt !important;
            line-height: 1.2 !important;
            box-sizing: border-box !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Contenedor Modal */}
      <div id="thermal-ticket-modal-box" className="relative w-full max-w-md bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="no-print flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-lg">
              {type === "cuenta" && "Vista Previa — Ticket de Cuenta"}
              {type === "comanda" && "Vista Previa — Comanda de Cocina"}
              {type === "corte" && "Vista Previa — Corte de Caja (Z)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ÁREA IMPRIMIBLE (Se ve en pantalla y se imprime) */}
        <div id="thermal-ticket-scroll-wrapper" className="overflow-y-auto my-4 p-4 bg-white text-black font-mono text-xs rounded-lg shadow-inner select-text">
          <div id="thermal-ticket-print-area" className="w-full">
            {/* CABECERA GENERAL CON LOGO */}
            <div className="text-center pb-3 mb-2 border-b-2 border-black flex flex-col items-center">
              <img
                src="/gaucho-logo.png"
                alt="Niño Gaucho"
                className="w-20 h-auto mb-1.5 object-contain filter grayscale contrast-200"
              />
              <h2 className="text-base font-black tracking-wider uppercase">
                NIÑO GAUCHO
              </h2>
              {type !== "cuenta" && (
                <p className="text-[10px] font-bold tracking-tight uppercase">
                  Corte de Carne & Gastronomía
                </p>
              )}
              <p className="text-[10px] mt-1 font-mono">{fechaFormateada}</p>
            </div>

            {/* CONTENIDO SEGÚN TIPO */}

            {/* 1. TICKET DE CUENTA */}
            {type === "cuenta" && (
              <>
                <div className="mb-2 pb-2 border-b border-dashed border-black text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>MESA #{data.mesaNumero || "N/A"}</span>
                    <span>ORDEN #{data.ordenId}</span>
                  </div>
                  {data.meseroNombre && <p>Mesero: {data.meseroNombre}</p>}
                </div>

                <div className="mb-3">
                  <div className="flex font-bold border-b border-black pb-1 mb-1 text-[10px]">
                    <span className="w-8">CANT</span>
                    <span className="flex-1">CONCEPTO</span>
                    <span className="w-16 text-right">TOTAL</span>
                  </div>
                  {data.items?.map((item, idx) => {
                    const unitPrice = item.cantidad > 0 ? item.subtotal / item.cantidad : item.subtotal;
                    return (
                      <div key={idx} className="mb-1.5">
                        <div className="flex justify-between items-start font-medium">
                          <span className="w-8">{item.cantidad}x</span>
                          <div className="flex-1 pr-1">
                            <span>{item.nombre}</span>
                            {item.cantidad > 1 && (
                              <span className="text-[10px] text-gray-700 block italic">
                                (${unitPrice.toFixed(2)} c/u)
                              </span>
                            )}
                          </div>
                          <span className="w-16 text-right font-bold">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div className="pl-8 text-[10px] text-gray-700">
                            {item.extras.map((e, ei) => (
                              <div key={ei}>+ {e.nombre} (${e.precio.toFixed(2)})</div>
                            ))}
                          </div>
                        )}
                        {item.opciones && item.opciones.length > 0 && (
                          <div className="pl-8 text-[10px] italic text-gray-700">
                            {item.opciones.map((o, oi) => (
                              <div key={oi}>* {o.valor}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-black pt-2 mb-3 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(data.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(data.propina || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Propina:</span>
                      <span>${(data.propina || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                    <span>TOTAL:</span>
                    <span>${(data.total || 0).toFixed(2)}</span>
                  </div>
                  {data.metodoPago && (
                    <p className="text-[10px] mt-1 italic">
                      Pago: {data.metodoPago.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="text-center pt-2 border-t border-dashed border-black text-[10px]">
                  <p>¡Gracias por su preferencia!</p>
                  <p>*** Niño Gaucho ***</p>
                </div>
              </>
            )}

            {/* 2. COMANDA DE COCINA */}
            {type === "comanda" && (
              <>
                <div className="text-center bg-black text-white font-black py-1.5 text-sm mb-3 tracking-widest rounded uppercase">
                  *** COMANDA COCINA ***
                </div>
                <div className="mb-3 pb-2 border-b-2 border-black text-xs font-bold space-y-1">
                  <div className="flex justify-between text-base font-black">
                    <span>MESA #{data.mesaNumero || "N/A"}</span>
                    <span>ORDEN #{data.ordenId}</span>
                  </div>
                  {data.meseroNombre && (
                    <p className="font-semibold text-sm">Mesero: {data.meseroNombre}</p>
                  )}
                </div>

                <div className="space-y-3 my-3">
                  {data.items?.map((item, idx) => (
                    <div key={idx} className="border-b border-dashed border-gray-400 pb-2">
                      <div className="flex items-start text-base font-black leading-tight">
                        <span className="w-10 text-lg font-black">{item.cantidad}x</span>
                        <span className="flex-1 uppercase tracking-wide">{item.nombre}</span>
                      </div>
                      {item.extras && item.extras.length > 0 && (
                        <div className="pl-10 mt-1 text-xs font-bold text-gray-800 space-y-0.5">
                          {item.extras.map((e, ei) => (
                            <div key={ei}>• [EXTRA] {e.nombre}</div>
                          ))}
                        </div>
                      )}
                      {item.opciones && item.opciones.length > 0 && (
                        <div className="pl-10 mt-1 text-xs font-black text-black">
                          {item.opciones.map((o, oi) => (
                            <div key={oi}>👉 {o.valor}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center pt-3 border-t-2 border-dashed border-black font-bold text-xs tracking-wider">
                  --- FIN DE COMANDA ---
                </div>
              </>
            )}

            {/* 3. CORTE DE CAJA Z */}
            {type === "corte" && (
              <>
                <div className="text-center bg-black text-white font-bold py-1 text-xs mb-2">
                  CORTE DE CAJA (CORTE Z)
                </div>
                <div className="text-[10px] mb-2 pb-2 border-b border-dashed border-black">
                  <p>Realizado por: {data.adminNombre || "Admin"}</p>
                  <p>
                    Inicio:{" "}
                    {data.fechaInicio
                      ? new Date(data.fechaInicio).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })
                      : "Inicio de turno"}
                  </p>
                  <p>
                    Fin:{" "}
                    {data.fechaFin
                      ? new Date(data.fechaFin).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })
                      : "Ahora"}
                  </p>
                </div>

                <div className="space-y-1 text-xs mb-3">
                  <div className="flex justify-between">
                    <span>Fondo Inicial:</span>
                    <span>${(data.montoInicial || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Efectivo:</span>
                    <span>${(data.ventasEfectivo || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Tarjeta:</span>
                    <span>${(data.ventasTarjeta || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-black pt-1">
                    <span>TOTAL VENTAS:</span>
                    <span>${(data.totalVentas || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span>Total Propinas:</span>
                    <span>${(data.totalPropinas || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black pt-2 mb-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Efectivo Esperado:</span>
                    <span>
                      ${((data.montoInicial || 0) + (data.ventasEfectivo || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Efectivo Declarado:</span>
                    <span>${(data.efectivoReal || 0).toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between font-bold text-sm border-t border-black pt-1 mt-1 ${
                      (data.diferencia || 0) < 0
                        ? "text-red-700"
                        : (data.diferencia || 0) > 0
                        ? "text-green-700"
                        : ""
                    }`}
                  >
                    <span>DIFERENCIA:</span>
                    <span>
                      {(data.diferencia || 0) > 0 ? "+" : ""}
                      ${(data.diferencia || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {data.notas && (
                  <div className="text-[10px] italic border-t border-black pt-1 mb-2">
                    Notas: {data.notas}
                  </div>
                )}

                <div className="text-center pt-2 border-t border-dashed border-black text-[10px]">
                  <p>Firma Administrador: __________________</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="no-print flex justify-end gap-3 pt-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-stone-800 hover:bg-stone-700 rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 font-semibold text-stone-950 rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            Imprimir Térmico
          </button>
        </div>
      </div>
    </div>
  );
}
