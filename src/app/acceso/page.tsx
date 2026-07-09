"use client";

import Link from "next/link";
import { GauchoLogo } from "@/components/GauchoIcons";
import { Shield, ChefHat, ClipboardList } from "lucide-react";

const roles = [
  {
    href: "/admin/login",
    label: "Administrador",
    desc: "Panel de control completo",
    icon: Shield,
    color: "from-gold/20 to-amber-900/20",
  },
  {
    href: "/mesero/login",
    label: "Mesero",
    desc: "Tomar pedidos desde tu celular",
    icon: ClipboardList,
    color: "from-sage/20 to-green-900/20",
  },
  {
    href: "/cocina/login",
    label: "Chef",
    desc: "Ver órdenes en la cocina",
    icon: ChefHat,
    color: "from-terracotta/20 to-red-900/20",
  },
];

export default function AccesoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark-section" style={{ background: "var(--color-cream)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <GauchoLogo className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-[0_0_30px_rgba(232,171,47,0.25)]" />
          </div>
          <h1 className="font-script text-3xl sm:text-4xl text-gold leading-tight drop-shadow-[0_4px_15px_rgba(232,171,47,0.2)]">
            Gaucho
          </h1>
          <p className="text-text-muted text-sm mt-2 tracking-wide">Acceso para empleados</p>
        </div>

        <div className="space-y-4">
          {roles.map((rol) => {
            const Icon = rol.icon;
            return (
              <Link
                key={rol.href}
                href={rol.href}
                className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(74, 50, 40, 0.12)",
                  }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${rol.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-chocolate group-hover:text-gold transition-colors">
                    {rol.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted tracking-wide">{rol.desc}</p>
                </div>
                <svg
                  className="w-5 h-5 text-text-muted group-hover:text-gold/50 translate-x-0 group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-text-muted hover:text-gold/50 text-xs tracking-wide transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
