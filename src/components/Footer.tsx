"use client";

import Link from "next/link";
import { GauchoLogo } from "./GauchoIcons";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/60 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-0 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <GauchoLogo className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="font-script text-xl sm:text-2xl text-gold">Gaucho</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40 mb-4 sm:mb-5 max-w-xs">
              Donde la tradición gaucha se encuentra con la más alta cocina y hospitalidad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5 tracking-wide">Enlaces rápidos</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { href: "/", label: "Inicio" },
                { href: "/#menu", label: "Menú" },
                { href: "/#galeria", label: "Galería" },
                { href: "/reservacion", label: "Reservación" },
                { href: "/#contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/40 hover:text-gold transition-all duration-200 hover:pl-1 block tracking-wide">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5 tracking-wide">Horarios</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li className="text-sm text-white/40 tracking-wide">Lun - Vie: 1:00 PM - 11:00 PM</li>
              <li className="text-sm text-white/40 tracking-wide">Sáb - Dom: 12:00 PM - 12:00 AM</li>
              <li className="flex items-center gap-2 text-sm text-white/30 mt-3">
                <svg className="w-3.5 h-3.5 text-gold/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                247 205 5070
              </li>
            </ul>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5 tracking-wide">Ubicación</h4>
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-gold/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-sm text-white/40 leading-relaxed tracking-wide">
                C. Juárez Nte. 215<br />
                Huamantla, Tlaxcala<br />
                México
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 py-4 sm:py-5 text-[11px] sm:text-xs text-white/25 tracking-wide">
          <span>&copy; 2026 Gaucho Restaurante. Todos los derechos reservados.</span>
          <div className="flex items-center gap-3">
            <Link href="/acceso" className="text-white/20 hover:text-gold/50 transition-colors duration-200">
              Acceso empleados
            </Link>
            <span className="text-white/10">|</span>
            <span>Hecho con
              <svg className="w-3 h-3 inline text-gold mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              para vos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
