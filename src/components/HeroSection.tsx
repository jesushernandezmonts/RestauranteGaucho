"use client";

import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-pulse-soft" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(217, 92, 43, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 92, 43, 0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-light mb-8 animate-fade-in">
          <Sparkles size={14} />
          <span>Parrilla Argentina Premium</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-slide-up">
          <span className="text-text-primary">Auténtico Sabor</span>
          <br />
          <span className="text-gradient">Argentino</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Cortes premium a la parrilla, pastas artesanales y una experiencia
          gastronómica que despierta todos tus sentidos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/#menu" className="btn-primary text-base px-8 py-4">
            Explorar Menú
            <ArrowDown size={18} />
          </Link>
          <Link href="/#contacto" className="btn-secondary text-base px-8 py-4">
            Reservar Mesa
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 md:mt-24 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
          {[
            { number: "10+", label: "Años de Tradición" },
            { number: "70+", label: "Platillos" },
            { number: "100%", label: "Carne Premium" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient">
                {stat.number}
              </div>
              <div className="text-xs md:text-sm text-text-muted mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
}
