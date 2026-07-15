"use client";

import React, { useEffect, useState } from "react";
import { useFestividad } from "@/hooks/useFestividad";

const FESTIVAL_THEMES: Record<string, {
  emojis: string[];
  colors: string[];
  bgOverlay: string;
}> = {
  navidad: {
    emojis: ["🎄", "❄️", "🎅", "⭐", "🎁", "🦌", "✨", "🔔"],
    colors: ["#C41E3A", "#FFD700", "#228B22"],
    bgOverlay: "linear-gradient(180deg, rgba(20,60,30,0.15) 0%, transparent 30%)",
  },
  diademuertos: {
    emojis: ["💀", "🌸", "🕯️", "🦋", "💐", "☠️", "🌼", "🎭"],
    colors: ["#FF6B35", "#E8A838", "#9B59B6"],
    bgOverlay: "linear-gradient(180deg, rgba(26,10,46,0.25) 0%, transparent 30%)",
  },
  sanvalentin: {
    emojis: ["❤️", "🌹", "💕", "🍫", "💝", "💌", "💘", "🥂"],
    colors: ["#E91E63", "#FF80AB", "#AD1457"],
    bgOverlay: "linear-gradient(180deg, rgba(45,10,26,0.2) 0%, transparent 30%)",
  },
  fiestaspatrias: {
    emojis: ["🦅", "🇲🇽", "🌵", "🎺", "🪅", "⭐", "🌟", "🎶"],
    colors: ["#006847", "#CE1126", "#FFFFFF"],
    bgOverlay: "linear-gradient(180deg, rgba(10,45,26,0.2) 0%, transparent 30%)",
  },
  semanasanta: {
    emojis: ["✝️", "🌷", "🕊️", "🌿", "💜", "🔮", "🌸", "🕯️"],
    colors: ["#7B2D8E", "#E8A838", "#4A0E6B"],
    bgOverlay: "linear-gradient(180deg, rgba(26,26,46,0.2) 0%, transparent 30%)",
  },
  anonuevo: {
    emojis: ["🎆", "🎇", "🥂", "🍾", "⭐", "✨", "🎊", "🌟"],
    colors: ["#FFD700", "#C0C0C0", "#1A1A5E"],
    bgOverlay: "linear-gradient(180deg, rgba(10,10,46,0.2) 0%, transparent 30%)",
  },
  feriahuamantla: {
    emojis: ["🌸", "🎭", "💃", "🌺", "🎨", "🌼", "🎪", "🦚"],
    colors: ["#FF4081", "#FFD740", "#E91E63"],
    bgOverlay: "linear-gradient(180deg, rgba(26,10,46,0.2) 0%, transparent 30%)",
  },
  halloween: {
    emojis: ["🎃", "👻", "🦇", "🕷️", "🕸️", "☠️", "🌙", "🍬"],
    colors: ["#FF6D00", "#7C4DFF", "#212121"],
    bgOverlay: "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, transparent 30%)",
  },
};

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function FestivityDecorations() {
  const { esFestividad, festividadActiva } = useFestividad();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!esFestividad || !festividadActiva || festividadActiva === "ninguna") {
      setParticles([]);
      setIsVisible(false);
      return;
    }

    const theme = FESTIVAL_THEMES[festividadActiva];
    if (!theme) return;

    const storageKey = `gaucho_festivity_played_${festividadActiva}`;
    if (sessionStorage.getItem(storageKey)) {
      setParticles([]);
      setIsVisible(false);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: theme.emojis[i % theme.emojis.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 16 + Math.random() * 14,
    }));

    sessionStorage.setItem(storageKey, "true");
    setParticles(newParticles);
    setIsVisible(true);

    const hideDecorations = window.setTimeout(() => {
      setParticles([]);
      setIsVisible(false);
    }, 20_000);

    return () => window.clearTimeout(hideDecorations);
  }, [esFestividad, festividadActiva]);

  if (!isVisible || !esFestividad || !festividadActiva || festividadActiva === "ninguna") return null;

  const theme = FESTIVAL_THEMES[festividadActiva];
  if (!theme) return null;

  return (
    <>
      {/* Top gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[5]"
        style={{ background: theme.bgOverlay }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-[6] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-0"
            style={{
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              animationName: "festivity-fall",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: "linear",
              animationIterationCount: 1,
              opacity: 0,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes festivity-fall {
          0%   { transform: translateY(-40px) rotate(0deg);   opacity: 0; }
          10%  { opacity: 0.85; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}
