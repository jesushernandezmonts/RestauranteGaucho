"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🥩</span>
            <span className="font-display text-xl md:text-2xl font-bold text-gradient">
              Gaucho
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-primary-light transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservacion"
              className="btn-primary !px-5 !py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              📅 Reservar
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-primary hover:text-primary-light transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-primary/10 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-text-secondary hover:text-primary-light hover:bg-surface-light transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#menu"
              onClick={() => setIsOpen(false)}
              className="block btn-primary text-center mt-4"
            >
              Ver Menú
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
