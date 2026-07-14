```
"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Download, CalendarDays } from "lucide-react";
// Eliminadas importaciones de date-fns y date-fns/locale por importación dinámica

import dynamic from 'next/dynamic'; // Importar dynamic de next/dynamic

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
function formatDateRangeDisplay(startDate: Date, endDate: Date, dateFns: any, esLocale: any): string {
    if (!dateFns || !esLocale) return 'Selecciona un rango'; // Fallback si no está cargado
    const formattedStartDate = dateFns.format(startDate, 'dd MMM yyyy', { locale: esLocale });
    const formattedEndDate = dateFns.format(endDate, 'dd MMM yyyy', { locale: esLocale });
    return formattedStartDate + ' - ' + formattedEndDate;
}

export default function ReportesSection() {
  const [dateFns, setDateFns] = useState<any>(null);
  const [esLocale, setEsLocale] = useState<any>(null);

  // Cargar date-fns y su locale solo en el cliente
  useEffect(() => {
    async function loadDateFns() {
      try {
        const df = await import('date-fns');
        const locale = await import('date-fns/locale/es');
        setDateFns(df);
        setEsLocale(locale.es); // Asegurarse de obtener el objeto de locale
        // Inicializar el rango de fechas con date-fns cargado
        setDateRange({ startDate: df.subDays(new Date(), 6), endDate: new Date() });
      } catch (error) {
        console.error("Error loading date-fns:", error);
      }
    }
    loadDateFns();
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
        if (dateRange.startDate && dateFns) {
          params.append("startDate", dateRange.startDate.toISOString());
        }
        if (dateRange.endDate && dateFns) {
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
        }const res = await fetch(url);
        const data = await res.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }
    // Solo cargar datos si dateFns está listo (es decir, el componente se ha montado)
    if (dateFns) {
      fetchReportData();
    }
  }, [dateRange, selectedMeseroId, selectedMetodoPago, dateFns]);

  const handleDateRangeChange = (option: string) => {
    if (!dateFns) return; // Asegurarse de que dateFns esté cargado

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day

    let newStartDate: Date | null = null;
    let newEndDate: Date | null = today;

    switch (option) {
      case "today":
        newStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start of day
        break;
      case "last7days":
        newStartDate = dateFns.subDays(today, 6);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        newStartDate = dateFns.startOfMonth(today);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "lastMonth":
        const lastMonth = dateFns.subDays(dateFns.startOfMonth(today), 1);
        newStartDate = dateFns.startOfMonth(lastMonth);
        newEndDate = dateFns.endOfMonth(lastMonth);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  const exportToCSV = () => {
    if (!reportData || reportData.propinasPorMesero.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = ["Mesero", "Propinas Totales", "Órdenes Cerradas", "Ventas Totales", "Propina Promedio por Orden"];
    const rows = reportData.propinasPorMesero.map(m => [
      m.nombre,
      m.propinasTotal.toFixed(2),
      m.ordenesCerradas,
      m.ventasTotales.toFixed(2),
      m.propinaPromedioPorOrden.toFixed(2),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_propinas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieChartData = useMemo(() => {
    if (!reportData?.resumen) return [];
    return [
      { name: 'Efectivo', value: reportData.resumen.totalPropinasEfectivo },
      { name: 'Tarjeta', value: reportData.resumen.totalPropinasTarjeta },
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Reportes de Propinas y Rendimiento
            </h1>
            <p className="text-sm text-gray-400">Análisis de métricas de meseros</p>
          </div>
          <button
            onClick={exportToCSV}
            className="btn-secondary !px-4 !py-2 text-sm font-medium"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="card grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                {dateRange.startDate && dateRange.endDate && dateFns && esLocale
                    ? formatDateRangeDisplay(dateRange.startDate, dateRange.endDate, dateFns, esLocale)
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
              {users.filter(user => user.role === "MESERO" || user.role === "ADMIN").map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.role})
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas Totales</p>
              <p className="text-3xl font-bold text-primary-light mt-2">
                ${reportData.resumen.totalPropinas.toFixed(2)}
              </p>
            </div>
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas en Efectivo</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${reportData.resumen.totalPropinasEfectivo.toFixed(2)}
              </p>
            </div>
            <div className="card flex flex-col items-center justify-center p-6">
              <p className="text-sm text-text-muted">Propinas con Tarjeta</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${reportData.resumen.totalPropinasTarjeta.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Propinas por Mesero - Bar Chart */}
            <div className="card p-6">
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
                                formatter={(value: number) => '$' + value.toFixed(2)}
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
                                label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#ccc' }}
                                formatter={(value: number, name: string) => ['$' + value.toFixed(2), name]}
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
