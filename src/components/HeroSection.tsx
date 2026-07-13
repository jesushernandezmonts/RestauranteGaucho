"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useFestividad } from "@/hooks/useFestividad";

const FESTIVAL_STYLES: Record<string, {
  gradient: string;
  dotColor: string;
  glowColor: string;
  titleColor: string;
  badge: string;
}> = {
  navidad: {
    gradient: "linear-gradient(135deg, rgba(20,60,30,0.93) 0%, rgba(40,80,40,0.75) 50%, rgba(20,60,30,0.93) 100%)",
    dotColor: "#C41E3A",
    glowColor: "rgba(196,30,58,0.15)",
    titleColor: "#FFD700",
    badge: "🎄 ¡Feliz Navidad!",
  },
  diademuertos: {
    gradient: "linear-gradient(135deg, rgba(26,10,46,0.93) 0%, rgba(50,20,70,0.75) 50%, rgba(26,10,46,0.93) 100%)",
    dotColor: "#FF6B35",
    glowColor: "rgba(255,107,53,0.15)",
    titleColor: "#E8A838",
    badge: "💀 Día de Muertos",
  },
  sanvalentin: {
    gradient: "linear-gradient(135deg, rgba(45,10,26,0.93) 0%, rgba(80,20,40,0.75) 50%, rgba(45,10,26,0.93) 100%)",
    dotColor: "#E91E63",
    glowColor: "rgba(233,30,99,0.15)",
    titleColor: "#FFD700",
    badge: "❤️ San Valentín",
  },
  fiestaspatrias: {
    gradient: "linear-gradient(135deg, rgba(10,45,26,0.93) 0%, rgba(0,104,71,0.75) 50%, rgba(10,45,26,0.93) 100%)",
    dotColor: "#CE1126",
    glowColor: "rgba(206,17,38,0.15)",
    titleColor: "#FFFFFF",
    badge: "🇲🇽 ¡Viva México!",
  },
  semanasanta: {
    gradient: "linear-gradient(135deg, rgba(26,26,46,0.93) 0%, rgba(60,20,80,0.75) 50%, rgba(26,26,46,0.93) 100%)",
    dotColor: "#7B2D8E",
    glowColor: "rgba(123,45,142,0.15)",
    titleColor: "#E8A838",
    badge: "✝️ Semana Santa",
  },
  anonuevo: {
    gradient: "linear-gradient(135deg, rgba(10,10,46,0.93) 0%, rgba(26,26,80,0.75) 50%, rgba(10,10,46,0.93) 100%)",
    dotColor: "#FFD700",
    glowColor: "rgba(255,215,0,0.15)",
    titleColor: "#FFD700",
    badge: "🎆 ¡Feliz Año Nuevo!",
  },
  feriahuamantla: {
    gradient: "linear-gradient(135deg, rgba(26,10,46,0.93) 0%, rgba(60,10,40,0.75) 50%, rgba(26,10,46,0.93) 100%)",
    dotColor: "#FF4081",
    glowColor: "rgba(255,64,129,0.15)",
    titleColor: "#FFD740",
    badge: "🌸 Feria de Huamantla",
  },
  halloween: {
    gradient: "linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(30,15,0,0.80) 50%, rgba(10,10,10,0.95) 100%)",
    dotColor: "#FF6D00",
    glowColor: "rgba(255,109,0,0.15)",
    titleColor: "#FF6D00",
    badge: "🎃 Halloween",
  },
};

export function HeroSection() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const { esFestividad, festividadActiva, titulo, mensaje } = useFestividad();

  useEffect(() => {
    function fetchConfig() {
      fetch("/api/config")
        .then((r) => r.json())
        .then((data) => {
          setConfig(data);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }

    fetchConfig();

    // Cross-tab instant sync
    try {
      const bc = new BroadcastChannel("gaucho_config_changes");
      bc.onmessage = () => fetchConfig();
      return () => bc.close();
    } catch {}
  }, []);

  const heroFondo = config.hero_fondo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80";
  const logoUrl = config.logo_url || "/gaucho-logo.png";

  const fest = esFestividad && festividadActiva ? FESTIVAL_STYLES[festividadActiva] : null;
  const gradient = fest?.gradient || "linear-gradient(135deg, rgba(61,42,28,0.92) 0%, rgba(74,50,40,0.7) 50%, rgba(61,42,28,0.92) 100%)";
  const dotColor = fest?.dotColor || "#E8AB2F";
  const glowColor = fest?.glowColor || "rgba(232,171,47,0.12)";
  const titleColor = fest?.titleColor;

  return (
    <section
      id="inicio"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-cover bg-center transition-all duration-1000"
      style={{
        backgroundImage: `${gradient}, url('${heroFondo}')`,
      }}
    >
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] transition-all duration-1000"
        style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: "50px 50px" }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 65%)` }}
      />

      {/* Festival badge */}
      {fest && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div
            className="px-5 py-2 rounded-full text-sm font-bold backdrop-blur-md border"
            style={{
              background: `${dotColor}22`,
              borderColor: `${dotColor}60`,
              color: fest.titleColor,
            }}
          >
            {titulo || fest.badge}
          </div>
          {mensaje && (
            <p className="text-center text-white/70 text-xs mt-2 max-w-xs mx-auto">{mensaje}</p>
          )}
        </div>
      )}

      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-4xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[100dvh] py-16 sm:py-20 md:py-24">
        {/* Logo flotante */}
        <div className="animate-float mb-4 sm:mb-5 md:mb-6 inline-block">
          {loaded ? (
            <Image
              src={logoUrl}
              alt="Gaucho Restaurante"
              width={260}
              height={260}
              className="w-[140px] sm:w-[180px] md:w-[260px] mx-auto drop-shadow-[0_0_40px_rgba(232,171,47,0.3)] object-contain"
              priority
            />
          ) : (
            <div className="w-[140px] sm:w-[180px] md:w-[260px] h-[140px] sm:h-[180px] md:h-[260px] rounded-full bg-chocolate/20 animate-pulse" />
          )}
        </div>

        <p className="text-white/60 text-[10px] sm:text-xs md:text-sm tracking-[4px] sm:tracking-[6px] uppercase font-medium mb-1 sm:mb-2">
          Bienvenido a
        </p>
        <h1
          className="font-script text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight mb-1 sm:mb-2 drop-shadow-[0_4px_15px_rgba(232,171,47,0.2)] transition-colors duration-700"
          style={{ color: titleColor || "#D4A23A" }}
        >
          Niño Gaucho
        </h1>
        <p className="font-display text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 tracking-wide mb-1 sm:mb-2 mt-2">
          Restaurante &amp; Parrilla
        </p>
        <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm md:max-w-lg mx-auto font-normal px-4 tracking-wide">
          Donde la tradición gaucha se encuentra con la más alta cocina
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-sm sm:max-w-none mx-auto">
          <a
            href="/reservacion"
            className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-chocolate font-bold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-gold-lg text-sm sm:text-base w-full tracking-wide"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Reservar Ahora
          </a>
          <a
            href="#menu"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white hover:bg-white/10 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base font-medium w-full tracking-wide"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Ver Menú
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 text-white/30 text-[9px] sm:text-[10px] tracking-[3px] uppercase animate-scroll">
          <span className="hidden sm:inline">Descubre</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>
    </section>
  );
}
