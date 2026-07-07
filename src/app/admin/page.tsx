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
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
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
    <div className="min-h-screen bg-charcoal flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-primary/10 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="p-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="text-primary" size={24} />
              <span className="font-display text-xl font-bold text-gradient">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-light"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? typeof window !== "undefined" && window.location.pathname === "/admin"
                : typeof window !== "undefined" &&
                  window.location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary-light font-medium"
                    : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-light/50 text-sm">
            <div className="flex-1 min-w-0">
              <p className="text-text-primary truncate">
                {session?.user?.nombre}
              </p>
              <p className="text-text-muted text-xs">Admin</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
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
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl glass"
        aria-label="Menú"
      >
        <Menu size={20} />
      </button>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
              Dashboard
            </h1>
            <p className="text-text-secondary mt-1">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-success" />
                </div>
                <TrendingUp size={16} className="text-success" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                ${stats.ventasHoy.toFixed(0)}
              </div>
              <div className="text-xs text-text-muted mt-1">Ventas hoy</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <ClipboardList size={20} className="text-info" />
                </div>
                <TrendingDown size={16} className="text-info" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.ordenesHoy}
              </div>
              <div className="text-xs text-text-muted mt-1">Órdenes hoy</div>
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
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                  <Package size={20} className="text-danger" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.alertasStock}
              </div>
              <div className="text-xs text-text-muted mt-1">
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
