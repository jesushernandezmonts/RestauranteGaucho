"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import MenuSection from "./_components/MenuSection";
import InventarioSection from "./_components/InventarioSection";
import ReservacionesSection from "./_components/ReservacionesSection";
import ReportesSection from "./_components/ReportesSection";
import UsuariosSection from "./_components/UsuariosSection";
import AparienciaSection from "./_components/AparienciaSection";
import FestividadesSection from "./_components/FestividadesSection";
import PromocionesSection from "./_components/PromocionesSection";
import CorteCajaSection from "./_components/CorteCajaSection";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  ImageIcon,
  Sparkles,
  Tag,
  Receipt,
  GripVertical,
} from "lucide-react";

type DashboardStats = {
  ventasHoy: number;
  ordenesHoy: number;
  meseroTop: { nombre: string; total: number } | null;
  alertasStock: number;
  ordenesRecientes: number;
};

type Section = "dashboard" | "menu" | "inventario" | "usuarios" | "reservaciones" | "reportes" | "apariencia" | "festividades" | "promociones" | "corteCaja";

const sectionLabels: Record<Section, { label: string; icon: React.ElementType }> = {
  dashboard: { label: "Dashboard", icon: TrendingUp },
  corteCaja: { label: "Corte de Caja", icon: Receipt },
  menu: { label: "Menú", icon: UtensilsCrossed },
  inventario: { label: "Inventario", icon: Package },
  usuarios: { label: "Usuarios", icon: Users },
  reservaciones: { label: "Reservaciones", icon: ClipboardList },
  reportes: { label: "Reportes", icon: TrendingDown },
  apariencia: { label: "Apariencia", icon: ImageIcon },
  festividades: { label: "Festividades", icon: Sparkles },
  promociones: { label: "Promociones", icon: Tag },
};

const DEFAULT_SECTIONS: Section[] = [
  "dashboard",
  "corteCaja",
  "menu",
  "inventario",
  "usuarios",
  "reservaciones",
  "reportes",
  "apariencia",
  "festividades",
  "promociones",
];

function SortableNavItem({
  section,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  section: Section;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 group rounded-xl transition-all duration-200"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1.5 cursor-grab active:cursor-grabbing text-text-muted hover:text-primary-light transition-colors rounded-lg"
        title="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-left"
        style={{
          color: isActive ? "#E0C060" : "#8A9A8E",
          background: isActive ? "rgba(212,162,58,0.10)" : "transparent",
        }}
      >
        <Icon size={18} />
        {label}
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sectionOrder, setSectionOrder] = useState<Section[]>(DEFAULT_SECTIONS);
  const [stats, setStats] = useState<DashboardStats>({
    ventasHoy: 0,
    ordenesHoy: 0,
    meseroTop: null,
    alertasStock: 0,
    ordenesRecientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const savedOrder = localStorage.getItem("admin_sidebar_order");
    if (savedOrder) {
      try {
        const parsed: Section[] = JSON.parse(savedOrder);
        const validOrder = parsed.filter((sec) => sec in sectionLabels);
        const missing = DEFAULT_SECTIONS.filter((sec) => !validOrder.includes(sec));
        setSectionOrder([...validOrder, ...missing]);
      } catch {
        // Fallback default
      }
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as Section);
        const newIndex = items.indexOf(over.id as Section);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("admin_sidebar_order", JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  async function loadStats() {
    setLoading(true);
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
        ? ordenes.filter((o: { createdAt: string }) => new Date(o.createdAt) >= today)
        : [];

      const ventasHoy = ordenesHoy.reduce(
        (sum: number, o: { total: number }) => sum + (o.total || 0),
        0
      );

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

  useEffect(() => {
    if (activeSection === "dashboard") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStats();
    } else {
       
      setLoading(false);
    }
  }, [activeSection]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dark-section">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  function renderSection() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      );
    }

    switch (activeSection) {
      case "corteCaja":
        return <CorteCajaSection />;
      case "menu":
        return <MenuSection />;
      case "inventario":
        return <InventarioSection />;
      case "reservaciones":
        return <ReservacionesSection />;
      case "reportes":
        return <ReportesSection />;
      case "usuarios":
        return <UsuariosSection />;
      case "apariencia":
        return <AparienciaSection />;
      case "festividades":
        return <FestividadesSection />;
      case "promociones":
        return <PromocionesSection />;
      default:
        return renderDashboard();
    }
  }

  function renderDashboard() {
    return (
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(212,162,58,0.12)" }}>
              <Shield size={20} style={{ color: "#D4A23A" }} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold" style={{ color: "#D4A23A" }}>
                Niño Gaucho
              </h1>
              <p className="text-xs" style={{ color: "#A0A0A0" }}>Admin</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl" style={{ background: "#000000", border: "1px solid rgba(212,162,58,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,168,119,0.15)" }}>
                <DollarSign size={20} style={{ color: "#8BA877" }} />
              </div>
              <TrendingUp size={16} style={{ color: "#8BA877" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
              ${stats.ventasHoy.toFixed(0)}
            </div>
            <div className="text-xs mt-1" style={{ color: "#A0A0A0" }}>Ventas hoy</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: "#000000", border: "1px solid rgba(212,162,58,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,162,58,0.12)" }}>
                <ClipboardList size={20} style={{ color: "#D4A23A" }} />
              </div>
              <TrendingDown size={16} style={{ color: "#A0A0A0" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
              {stats.ordenesHoy}
            </div>
            <div className="text-xs mt-1" style={{ color: "#A0A0A0" }}>Órdenes hoy</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: "#000000", border: "1px solid rgba(212,162,58,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,162,58,0.08)" }}>
                <Users size={20} style={{ color: "#D4A23A" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
              {stats.meseroTop?.nombre || "—"}
            </div>
            <div className="text-xs mt-1" style={{ color: "#A0A0A0" }}>
              {stats.meseroTop
                ? `$${stats.meseroTop.total?.toFixed(0)} en ventas`
                : "Mejor mesero"}
            </div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: "#000000", border: "1px solid rgba(212,162,58,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,77,77,0.15)" }}>
                <Package size={20} style={{ color: "#FF4D4D" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: stats.alertasStock > 0 ? "#FF4D4D" : "#FFFFFF" }}>
              {stats.alertasStock}
            </div>
            <div className="text-xs mt-1" style={{ color: "#A0A0A0" }}>
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
              <button
                onClick={() => setActiveSection("menu")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group text-left"
              >
                <UtensilsCrossed
                  size={18}
                  className="text-primary-light group-hover:scale-110 transition-transform"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary">
                  Gestionar Menú
                </span>
              </button>
              <button
                onClick={() => setActiveSection("inventario")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group text-left"
              >
                <Package
                  size={18}
                  className="text-primary-light group-hover:scale-110 transition-transform"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary">
                  Ver Inventario
                </span>
              </button>
              <button
                onClick={() => setActiveSection("reportes")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all group text-left"
              >
                <ClipboardList
                  size={18}
                  className="text-primary-light group-hover:scale-110 transition-transform"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary">
                  Reportes de Meseros
                </span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">
              Resumen del Día
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                <span className="text-sm text-text-secondary">Órdenes totales</span>
                <span className="font-bold text-text-primary">{stats.ordenesRecientes}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                <span className="text-sm text-text-secondary">Promedio por orden</span>
                <span className="font-bold text-text-primary">
                  ${stats.ordenesHoy > 0 ? (stats.ventasHoy / stats.ordenesHoy).toFixed(0) : "0"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-light/50">
                <span className="text-sm text-text-secondary">Alertas de inventario</span>
                <span className={`font-bold ${stats.alertasStock > 0 ? "text-danger" : "text-success"}`}>
                  {stats.alertasStock > 0 ? `${stats.alertasStock} críticas` : "0 críticas"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-section flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "#1B1512", borderRight: "1px solid rgba(212,162,58,0.08)" }}
      >
        <div className="p-4" style={{ borderBottom: "1px solid rgba(212,162,58,0.08)" }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSection("dashboard")}
              className="flex items-center gap-2"
            >
              <span className="text-2xl"></span>
              <span className="font-script text-xl" style={{ color: "#D4A23A" }}>
                Niño Gaucho
              </span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl"
              style={{ color: "#8A9A8E" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionOrder}
              strategy={verticalListSortingStrategy}
            >
              {sectionOrder.map((sectionKey) => {
                const info = sectionLabels[sectionKey];
                if (!info) return null;
                return (
                  <SortableNavItem
                    key={sectionKey}
                    section={sectionKey}
                    label={info.label}
                    icon={info.icon}
                    isActive={activeSection === sectionKey}
                    onClick={() => {
                      setActiveSection(sectionKey);
                      setSidebarOpen(false);
                    }}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </nav>
        <div
          className="absolute bottom-4 left-4 right-4"
          style={{ borderTop: "1px solid rgba(212,162,58,0.08)", paddingTop: "12px" }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(212,162,58,0.08)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(212,162,58,0.2)", color: "#D4A23A" }}
            >
              {(session?.user?.nombre || "A")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#F2E8D5" }}>
                {session?.user?.nombre}
              </p>
              <p className="text-xs" style={{ color: "#B89878" }}>Panel Admin</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#C4553A" }}
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
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl"
        style={{ background: "#000000", border: "1px solid rgba(212,162,58,0.08)" }}
        aria-label="Menú"
      >
        <Menu size={20} style={{ color: "#E0C060" }} />
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pt-16 lg:pt-0">
        {renderSection()}
      </div>
    </div>
  );
}
