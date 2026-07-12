"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GauchoLogo } from "./GauchoIcons";
import { useFestividad } from "@/hooks/useFestividad";

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
  const { esFestividad, festividadActiva } = useFestividad();

  const getHuamantlaColors = () => {
    return {
      primary: "#FF4081",
      secondary: "#FFD740", 
      bg: "#1A0A2E",
      text: "#F5E6F5",
    };
  };

  const colors = getHuamantlaColors();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const getNavbarClasses = () => {
    if (esFestividad && festividadActiva === "huamantla") {
      return {
        header: `fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[${colors.bg}]/95 backdrop-blur-xl shadow-2xl border-b border-[${colors.primary}]/30' : 'bg-transparent'}`,
        logo: `font-script text-xl sm:text-2xl md:text-3xl text-[${colors.primary}] tracking-wide hover:text-[${colors.secondary}] transition-all duration-300`,
        navLink: `text-[${colors.text}]/80 hover:text-[${colors.secondary}] hover:bg-[${colors.primary}]/20 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 border border-transparent hover:border-[${colors.primary}]/30`,
        reserveBtn: `bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}] hover:from-[${colors.secondary}] hover:to-[${colors.primary}] text-[${colors.bg}] font-bold px-4 lg:px-5 py-2.5 rounded-full text-sm transition-all duration-500 hover:scale-110 hover:shadow-[0_10px_25px_${colors.primary}40] border border-[${colors.primary}]/30`,
        mobileMenu: `fixed inset-0 z-[55] md:hidden bg-[${colors.bg}]`,
        mobileOverlay: `absolute inset-0 bg-black/50 backdrop-blur-sm`,
        mobileLink: `text-[${colors.text}]/90 hover:text-[${colors.secondary}] w-full max-w-[280px] text-center py-4 text-lg font-medium hover:bg-[${colors.primary}]/20 rounded-xl transition-all duration-300 transform hover:scale-105 border border-transparent hover:border-[${colors.secondary}]/30`,
        mobileReserveBtn: `bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}] hover:from-[${colors.secondary}] hover:to-[${colors.primary}] text-[${colors.bg}] font-bold w-full max-w-[280px] text-center py-4 rounded-full text-lg mt-4 shadow-[${colors.primary}]/40 transition-all duration-300 hover:scale-110 border border-[${colors.primary}]/30`,
      };
    }

    return {
      header: `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-charcoal/95 backdrop-blur-xl shadow-lg" : "bg-transparent"}`,
      logo: `font-script text-xl sm:text-2xl md:text-3xl text-gold tracking-wide`,
      navLink: `text-white/70 hover:text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 tracking-wide`,
      reserveBtn: `ml-2 bg-gold hover:bg-gold-light text-chocolate font-bold px-4 lg:px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-gold`,
      mobileMenu: `fixed inset-0 z-[55] md:hidden`,
      mobileOverlay: `absolute inset-0 bg-black/50 backdrop-blur-sm`,
      mobileLink: `text-white/80 hover:text-white w-full max-w-[280px] text-center py-4 text-lg font-medium hover:bg-white/10 rounded-xl transition-colors tracking-wide`,
      mobileReserveBtn: `bg-gold hover:bg-gold-light text-chocolate font-bold w-full max-w-[280px] text-center py-4 rounded-full text-lg mt-4 shadow-gold transition-colors`,
    };
  };

  const classes = getNavbarClasses();

  return (
    <>
      <header className={classes.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Ir al inicio">
            <span className={classes.logo}>Gaucho</span>
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
                className={classes.navLink}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservacion"
              className={classes.reserveBtn}
            >
              Reservar
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={classes.mobileMenu} onClick={() => setIsOpen(false)}>
          <div className={classes.mobileOverlay} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={classes.mobileLink}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservacion"
              onClick={() => setIsOpen(false)}
              className={classes.mobileReserveBtn}
            >
              Reservar
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
