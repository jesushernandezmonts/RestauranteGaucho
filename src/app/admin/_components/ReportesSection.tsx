"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Download, CalendarDays, FileSpreadsheet, FileText } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"; // NUEVA IMPORTACIÓN ESTÁTICA
import { es } from 'date-fns/locale/es'; // NUEVA IMPORTACIÓN ESTÁTICA
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// Importaciones dinámicas para Recharts
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

type UserBasic = {
  id: number;
  nombre: string;
  role: string;
};

type ReportSummary = {
  totalPropinas: number;
  totalPropinasEfectivo: number;
  totalPropinasTarjeta: number;
};

type MeseroMetrics = {
  meseroId: number;
  nombre: string;
  propinasTotal: number;
  ordenesCerradas: number;
  ventasTotales: number;
  propinaPromedioPorOrden: number;
};

type ReportData = {
  resumen: ReportSummary;
  propinasPorMesero: MeseroMetrics[];
  detallePagos: any[]; // Considerar tipado más específico si es necesario
  detalleOrdenes: any[]; // Considerar tipado más específico si es necesario
};

type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

const dateRangeOptions = [
  { label: "Últimos 7 días", value: "last7days" },
  { label: "Este mes", value: "thisMonth" },
  { label: "Hoy", value: "today" },
  { label: "Mes anterior", value: "lastMonth" },
];

// Función auxiliar para formatear el rango de fechas para mostrar
function formatDateRangeDisplay(startDate: Date, endDate: Date, dateFnsFormat: any, esLocale: any): string {
  if (!dateFnsFormat || !esLocale) return 'Selecciona un rango'; // Fallback si no está cargado
  const formattedStartDate = dateFnsFormat(startDate, 'dd MMM yyyy', { locale: esLocale });
  const formattedEndDate = dateFnsFormat(endDate, 'dd MMM yyyy', { locale: esLocale });
  return formattedStartDate + ' - ' + formattedEndDate;
}

export default function ReportesSection() {
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [selectedMeseroId, setSelectedMeseroId] = useState<string>("all");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>("Todos");
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inicializar el rango de fechas con date-fns cargado
  useEffect(() => {
    setDateRange({ startDate: subDays(new Date(), 6), endDate: new Date() });
  }, []);

  // Colores para los gráficos de pastel
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

  // Cargar usuarios para el filtro
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/usuarios/basic");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, []);

  // Cargar datos del reporte
  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        // Asegurarse de que dateFns esté cargado antes de usarlo
        if (dateRange.startDate) {
          params.append("startDate", dateRange.startDate.toISOString());
        }
        if (dateRange.endDate) {
          params.append("endDate", dateRange.endDate.toISOString());
        }
        if (selectedMeseroId !== "all") {
          params.append("meseroId", selectedMeseroId);
        }
        if (selectedMetodoPago !== "Todos") {
          params.append("metodoPago", selectedMetodoPago);
        }

        // Construimos la URL de forma más tradicional
        let url = `/api/reportes/propinas`;
        const queryString = params.toString(); // Obtener la cadena de consulta por separado

        if (queryString) { // Verificar si hay parámetros
          url = url + `?` + queryString; // Concatenar explícitamente
        }
        const res = await fetch(url);
        const data = await res.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }
    // Solo cargar datos si dateFns está listo (es decir, el componente se ha montado)
    fetchReportData();
  }, [dateRange, selectedMeseroId, selectedMetodoPago]);

  const handleDateRangeChange = (value: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day

    let newStartDate: Date | null = null;
    let newEndDate: Date | null = today;

    switch (value) {
      case "today":
        newStartDate = new Date(today);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        newStartDate = subDays(today, 6);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        newStartDate = startOfMonth(today);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  const exportToExcel = () => {
    if (!reportData) {
      alert("No hay datos para exportar.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const resumenData = [
      { Métrica: "Propinas Totales ($)", Monto: reportData.resumen.totalPropinas },
      { Métrica: "Propinas en Efectivo ($)", Monto: reportData.resumen.totalPropinasEfectivo },
      { Métrica: "Propinas en Tarjeta ($)", Monto: reportData.resumen.totalPropinasTarjeta },
    ];
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");

    // Hoja 2: Meseros
    const meserosData = reportData.propinasPorMesero.map((m) => ({
      "Mesero": m.nombre,
      "Propinas Totales ($)": m.propinasTotal,
      "Órdenes Cerradas": m.ordenesCerradas,
      "Ventas Totales ($)": m.ventasTotales,
      "Propina Promedio / Orden ($)": m.propinaPromedioPorOrden,
    }));
    const wsMeseros = XLSX.utils.json_to_sheet(meserosData);
    XLSX.utils.book_append_sheet(wb, wsMeseros, "Rendimiento Meseros");

    // Hoja 3: Detalle Órdenes
    if (reportData.detalleOrdenes && reportData.detalleOrdenes.length > 0) {
      const ordenesData = reportData.detalleOrdenes.map((o: any) => ({
        "ID Orden": o.id,
        "Mesa": `Mesa ${o.mesa?.numero || "N/A"}`,
        "Mesero": o.mesero?.nombre || "N/A",
        "Fecha": new Date(o.createdAt).toLocaleString("es-MX"),
        "Método de Pago": (o.metodoPago || "N/A").toUpperCase(),
        "Subtotal ($)": o.total || 0,
        "Descuento ($)": o.descuento || 0,
        "Propina ($)": o.propina || 0,
        "Total Final ($)": o.total || 0,
      }));
      const wsOrdenes = XLSX.utils.json_to_sheet(ordenesData);
      XLSX.utils.book_append_sheet(wb, wsOrdenes, "Órdenes Cerradas");
    }

    XLSX.writeFile(wb, `reporte_ventas_gaucho_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF();

    // Título y Encabezado
    doc.setFontSize(18);
    doc.text("RESTAURANTE NIÑO GAUCHO", 14, 18);

    doc.setFontSize(11);
    doc.text("Reporte Ejecutivo de Ventas y Propinas", 14, 25);
    doc.setFontSize(9);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString("es-MX")}`, 14, 31);

    // Tabla Resumen
    autoTable(doc, {
      startY: 36,
      head: [["Métrica Resumen", "Monto ($)"]],
      body: [
        ["Propinas Totales", `$${(reportData.resumen.totalPropinas || 0).toFixed(2)}`],
        ["Propinas en Efectivo", `$${(reportData.resumen.totalPropinasEfectivo || 0).toFixed(2)}`],
        ["Propinas en Tarjeta", `$${(reportData.resumen.totalPropinasTarjeta || 0).toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [212, 162, 58] },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 12;

    // Tabla Meseros
    if (reportData.propinasPorMesero.length > 0) {
      doc.setFontSize(11);
      doc.text("Rendimiento por Mesero", 14, currentY);

      const meserosRows = reportData.propinasPorMesero.map((m) => [
        m.nombre,
        `$${m.propinasTotal.toFixed(2)}`,
        m.ordenesCerradas.toString(),
        `$${m.ventasTotales.toFixed(2)}`,
        `$${m.propinaPromedioPorOrden.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Mesero", "Propinas", "Órdenes", "Ventas Totales", "Propina Prom."]],
        body: meserosRows,
        theme: "grid",
        headStyles: { fillColor: [40, 40, 40] },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;
    }

    // Tabla Órdenes
    if (reportData.detalleOrdenes && reportData.detalleOrdenes.length > 0) {
      doc.setFontSize(11);
      doc.text("Detalle de Órdenes Cerradas", 14, currentY);

      const ordenesRows = reportData.detalleOrdenes.map((o: any) => [
        `#${o.id}`,
        `Mesa ${o.mesa?.numero || "N/A"}`,
        o.mesero?.nombre || "N/A",
        new Date(o.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }),
        (o.metodoPago || "N/A").toUpperCase(),
        `$${(o.total || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["ID", "Mesa", "Mesero", "Fecha", "Método", "Total"]],
        body: ordenesRows,
        theme: "striped",
        headStyles: { fillColor: [212, 162, 58] },
      });
    }

    doc.save(`reporte_ventas_gaucho_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
  };

  const exportToCSV = () => {
    if (!reportData) {
      alert("No hay datos para exportar.");
      return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM para soporte completo en MS Excel

    // Seccion 1: Resumen General
    csvContent += "=== RESUMEN GENERAL DE VENTAS Y PROPINAS ===\n";
    csvContent += `Propinas Totales,$${reportData.resumen.totalPropinas.toFixed(2)}\n`;
    csvContent += `Propinas en Efectivo,$${reportData.resumen.totalPropinasEfectivo.toFixed(2)}\n`;
    csvContent += `Propinas en Tarjeta,$${reportData.resumen.totalPropinasTarjeta.toFixed(2)}\n\n`;

    // Seccion 2: Desglose por Mesero
    csvContent += "=== RENDIMIENTO POR MESERO ===\n";
    csvContent += "Mesero,Propinas Totales,Órdenes Cerradas,Ventas Totales,Propina Promedio por Orden\n";
    reportData.propinasPorMesero.forEach((m) => {
      csvContent += `"${m.nombre}",$${m.propinasTotal.toFixed(2)},${m.ordenesCerradas},$${m.ventasTotales.toFixed(2)},$${m.propinaPromedioPorOrden.toFixed(2)}\n`;
    });
    csvContent += "\n";

    // Seccion 3: Detalle de Órdenes
    if (reportData.detalleOrdenes && reportData.detalleOrdenes.length > 0) {
      csvContent += "=== DETALLE DE ÓRDENES CERRADAS ===\n";
      csvContent += "ID Orden,Mesa,Mesero,Fecha,Metodo Pago,Subtotal,Descuento,Propina,Total Final\n";
      reportData.detalleOrdenes.forEach((o: any) => {
        const fecha = new Date(o.createdAt).toLocaleString("es-MX");
        csvContent += `${o.id},Mesa ${o.mesa?.numero || "N/A"},"${o.mesero?.nombre || "N/A"}","${fecha}",${o.metodoPago || "N/A"},$${(o.total || 0).toFixed(2)},$${(o.descuento || 0).toFixed(2)},$${(o.propina || 0).toFixed(2)},$${(o.total || 0).toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_ventas_gaucho_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieChartData = useMemo(() => {
    if (!reportData?.detallePagos) return [];
    let totalPropinasEfectivo = 0;
    let totalPropinasTarjeta = 0;
    reportData.detallePagos.forEach((pago) => {
      const propina = pago.propina || 0;
      if (pago.metodo === "efectivo") {
        totalPropinasEfectivo += pago.propina || 0;
      } else if (pago.metodo === "tarjeta") {
        totalPropinasTarjeta += pago.propina || 0;
      }
    });
    return [
      { name: 'Efectivo', value: totalPropinasEfectivo },
      { name: 'Tarjeta', value: totalPropinasTarjeta },
    ].filter(item => item.value > 0);
  }, [reportData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Reportes de Propinas y Rendimiento
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Análisis de métricas de meseros</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Descargar reporte en formato Excel (.xlsx)"
            >
              <FileSpreadsheet size={16} /> Excel (.xlsx)
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Descargar reporte oficial en PDF"
            >
              <FileText size={16} /> PDF (.pdf)
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
              title="Descargar en CSV"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-4">
          <div>
            <label className="text-xs text-text-muted mb-2 block">Rango de Fechas</label>
            <select
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
              value="" // Esto permite que el placeholder se muestre inicialmente
            >
              <option value="" disabled>Seleccionar rango</option>
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* Custom Date Picker (TODO: Implement or use a library) */}
            <div className="mt-2 flex items-center text-xs text-gray-400 gap-1">
              <CalendarDays size={12} />
              {dateRange.startDate && dateRange.endDate && es
                ? formatDateRangeDisplay(dateRange.startDate, dateRange.endDate, format, es)
                : 'Selecciona un rango'
              }
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-2 block">Mesero</label>
            <select
              onChange={(e) => setSelectedMeseroId(e.target.value)}
              value={selectedMeseroId}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
            >
              <option value="all">Todos los Meseros</option>
              {users.filter(user => user.role === "MESERO").map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-2 block">Método de Pago</label>
            <select
              onChange={(e) => setSelectedMetodoPago(e.target.value)}
              value={selectedMetodoPago}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
            >
              <option value="Todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {reportData?.resumen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas Totales</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary-light mt-2">
                ${(reportData.resumen.totalPropinas || 0).toFixed(2)}
              </p>
            </div>
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas en Efectivo</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${(reportData.resumen.totalPropinasEfectivo || 0).toFixed(2)}
              </p>
            </div>
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas con Tarjeta</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${(reportData.resumen.totalPropinasTarjeta || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Propinas por Mesero - Bar Chart */}
          <div className="card p-4 md:p-6">
            <h3 className="font-semibold text-white mb-4">Propinas por Mesero</h3>
            {reportData?.propinasPorMesero && reportData.propinasPorMesero.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.propinasPorMesero}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="nombre" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#ccc' }}
                    formatter={(value: any) => (typeof value === 'number' ? '$' + value.toFixed(2) : value)}
                  />
                  <Legend />
                  <Bar dataKey="propinasTotal" fill="#8884d8" name="Propinas Totales" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-text-muted py-10">No hay datos de propinas por mesero.</p>
            )}
          </div>

          {/* Propinas por Método de Pago - Pie Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">Propinas por Método de Pago</h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => name + ' ' + ((percent || 0) * 100).toFixed(0) + '%'}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#ccc' }}
                    formatter={(value: any, name: any) => { const formattedValue = typeof value === 'number' ? '$' + value.toFixed(2) : ''; return [formattedValue, name || '']; }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-text-muted py-10">No hay datos de propinas por método de pago.</p>
            )}
          </div>
        </div>

        {/* Table: Propinas y Rendimiento por Mesero */}
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4">Detalle por Mesero</h3>
          {reportData?.propinasPorMesero && reportData.propinasPorMesero.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="text-sm text-text-muted border-b border-primary/10">
                    <th className="py-2 px-4">Mesero</th>
                    <th className="py-2 px-4">Propinas Totales</th>
                    <th className="py-2 px-4">Órdenes Cerradas</th>
                    <th className="py-2 px-4">Ventas Totales</th>
                    <th className="py-2 px-4">Propina Promedio/Orden</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.propinasPorMesero.map((mesero) => (
                    <tr key={mesero.meseroId} className="border-b border-primary/5 last:border-b-0">
                      <td className="py-3 px-4 font-medium text-white">{mesero.nombre}</td>
                      <td className="py-3 px-4 text-primary-light">${mesero.propinasTotal.toFixed(2)}</td>
                      <td className="py-3 px-4">{mesero.ordenesCerradas}</td>
                      <td className="py-3 px-4">${mesero.ventasTotales.toFixed(2)}</td>
                      <td className="py-3 px-4">${mesero.propinaPromedioPorOrden.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-text-muted py-10">No hay datos de meseros para el período seleccionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
