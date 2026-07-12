"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GauchoLogo } from "./GauchoIcons";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#menu", label: "Menú" },
  { href: "/#galeria", label: "Galería" },
  { href: "/reservacion", label: "Reservación" },
  { href: "/#contacto", label: "Contacto" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-charcoal/95 backdrop-blur-xl shadow-lg" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Ir al inicio">
            <span className="font-script text-xl sm:text-2xl md:text-3xl text-gold tracking-wide">Gaucho</span>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 z-[60] relative cursor-pointer"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            <span className={`block w-[22px] sm:w-[26px] h-[2px] bg-white rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
            <span className={`block w-[22px] sm:w-[26px] h-[2px] bg-white rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-[22px] sm:w-[26px] h-[2px] bg-white rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 translate-y-[-5px]" : ""}`} />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservacion"
              className="ml-2 bg-gold hover:bg-gold-light text-chocolate font-bold px-4 lg:px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-gold"
            >
              Reservar
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[55] md:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-charcoal" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white w-full max-w-[280px] text-center py-4 text-lg font-medium hover:bg-white/10 rounded-xl transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservacion"
              onClick={() => setIsOpen(false)}
              className="bg-gold hover:bg-gold-light text-chocolate font-bold w-full max-w-[280px] text-center py-4 rounded-full text-lg mt-4 shadow-gold transition-colors"
            >
              Reservar
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
