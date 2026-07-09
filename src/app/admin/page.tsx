"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LogOut,
  Loader2,
  DollarSign,
  ClipboardList,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Menu,
  X,
} from "lucide-react";

type DashboardStats = {
  ventasHoy: number;
  ordenesHoy: number;
  meseroTop: { nombre: string; total: number } | null;
  alertasStock: number;
  ordenesRecientes: number;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    ventasHoy: 0,
    ordenesHoy: 0,
    meseroTop: null,
    alertasStock: 0,
    ordenesRecientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [ordenesRes, ingredientesRes] = await Promise.all([
        fetch("/api/ordenes"),
        fetch("/api/inventario/alertas"),
      ]);

      const ordenes = await ordenesRes.json();
      const alertas = await ingredientesRes.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordenesHoy = Array.isArray(ordenes)
        ? ordenes.filter(
            (o: { createdAt: string }) => new Date(o.createdAt) >= today
          )
        : [];

      const ventasHoy = ordenesHoy.reduce(
        (sum: number, o: { total: number }) => sum + (o.total || 0),
        0
      );

      // Get top waiter
      const meseroMap: Record<string, number> = {};
      ordenesHoy.forEach((o: { mesero?: { nombre: string }; total: number }) => {
        if (o.mesero?.nombre) {
          meseroMap[o.mesero.nombre] =
            (meseroMap[o.mesero.nombre] || 0) + (o.total || 0);
        }
      });
      let meseroTop = null;
      let maxVentas = 0;
      for (const [nombre, total] of Object.entries(meseroMap)) {
        if (total > maxVentas) {
          maxVentas = total;
          meseroTop = { nombre, total };
        }
      }

      setStats({
        ventasHoy,
        ordenesHoy: ordenesHoy.length,
        meseroTop,
        alertasStock: Array.isArray(alertas) ? alertas.length : 0,
        ordenesRecientes: Array.isArray(ordenes) ? ordenes.length : 0,
      });
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: TrendingUp },
    { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
    { href: "/admin/inventario", label: "Inventario", icon: Package },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/reservaciones", label: "Reservaciones", icon: ClipboardList },
    { href: "/admin/reportes", label: "Reportes", icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen dark-section flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "var(--color-cream)", borderRight: "1px solid rgba(74, 50, 40, 0.1)" }}
      >
        <div className="p-4" style={{ borderBottom: "1px solid rgba(74, 50, 40, 0.1)" }}>
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-2xl">🥩</span>
              <span className="font-script text-xl" style={{ color: "#E8AB2F" }}>
                Gaucho
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl" style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                color:
                  typeof window !== "undefined" &&
                  window.location.pathname === link.href
                    ? "#E8AB2F"
                    : "var(--color-text-secondary)",
                background:
                  typeof window !== "undefined" &&
                  window.location.pathname === link.href
                    ? "rgba(232,171,47,0.1)"
                    : "transparent",
              }}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4" style={{ borderTop: "1px solid rgba(74, 50, 40, 0.1)", paddingTop: "12px" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(74, 50, 40, 0.05)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(232,171,47,0.2)", color: "#E8AB2F" }}>
              {(session?.user?.nombre || "A")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-chocolate)" }}>
                {session?.user?.nombre}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Admin</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="p-2 rounded-lg transition-colors" style={{ color: "var(--color-text-muted)" }}
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl card"
        aria-label="Menú"
      >
        <Menu size={20} style={{ color: "#E8AB2F" }} />
      </button>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="card mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: "rgba(232,171,47,0.15)" }}>
                <Shield size={20} style={{ color: "#E8AB2F" }} />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold" style={{ color: "#E8AB2F" }}>
                  Gaucho
                </h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Panel Admin</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,168,119,0.2)" }}>
                  <DollarSign size={20} style={{ color: "#8BA877" }} />
                </div>
                <TrendingUp size={16} style={{ color: "#8BA877" }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                ${stats.ventasHoy.toFixed(0)}
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Ventas hoy</div>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,171,47,0.15)" }}>
                  <ClipboardList size={20} style={{ color: "#E8AB2F" }} />
                </div>
                <TrendingDown size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {stats.ordenesHoy}
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Órdenes hoy</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Users size={20} className="text-secondary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.meseroTop?.nombre || "—"}
              </div>
              <div className="text-xs text-text-muted mt-1">
                {stats.meseroTop
                  ? `$${stats.meseroTop.total?.toFixed(0)} en ventas`
                  : "Mejor mesero"}
              </div>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(196,85,58,0.2)" }}>
                  <Package size={20} style={{ color: "#C4553A" }} />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {stats.alertasStock}
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Alertas de stock
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin/menu"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group"
                >
                  <UtensilsCrossed
                    size={18}
                    className="text-primary-light group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">
                    Gestionar Menú
                  </span>
                </Link>
                <Link
                  href="/admin/inventario"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group"
                >
                  <Package
                    size={18}
                    className="text-primary-light group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">
                    Ver Inventario
                  </span>
                </Link>
                <Link
                  href="/admin/reportes"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group"
                >
                  <ClipboardList
                    size={18}
                    className="text-primary-light group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">
                    Reportes de Meseros
                  </span>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4">
                Resumen del Día
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                  <span className="text-sm text-text-secondary">
                    Órdenes totales
                  </span>
                  <span className="font-bold text-text-primary">
                    {stats.ordenesRecientes}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                  <span className="text-sm text-text-secondary">
                    Promedio por orden
                  </span>
                  <span className="font-bold text-text-primary">
                    $
                    {stats.ordenesHoy > 0
                      ? (stats.ventasHoy / stats.ordenesHoy).toFixed(0)
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                  <span className="text-sm text-text-secondary">
                    Alertas de inventario
                  </span>
                  <span
                    className={`font-bold ${
                      stats.alertasStock > 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {stats.alertasStock > 0
                      ? `${stats.alertasStock} 🔴`
                      : "0 🟢"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
