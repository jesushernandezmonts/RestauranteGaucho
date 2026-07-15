"use client";

import React, { useEffect, useState } from "react";
import { useFestividad } from "@/hooks/useFestividad";

type Shape = "circle" | "star" | "petal" | "diamond" | "drop";

interface ThemeConfig {
  shapes: { type: Shape; colors: string[] }[];
  bgOverlay: string;
}

const FESTIVAL_THEMES: Record<string, ThemeConfig> = {
  navidad: {
    shapes: [
      { type: "circle", colors: ["#C41E3A", "#228B22"] },
      { type: "star", colors: ["#FFD700", "#FFFFFF"] },
      { type: "drop", colors: ["#C41E3A"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(20,60,30,0.12) 0%, transparent 30%)",
  },
  diademuertos: {
    shapes: [
      { type: "petal", colors: ["#FF6B35", "#E8A838"] },
      { type: "circle", colors: ["#9B59B6", "#FF6B35"] },
      { type: "diamond", colors: ["#E8A838"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(26,10,46,0.2) 0%, transparent 30%)",
  },
  sanvalentin: {
    shapes: [
      { type: "circle", colors: ["#E91E63", "#FF80AB"] },
      { type: "drop", colors: ["#AD1457", "#E91E63"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(45,10,26,0.15) 0%, transparent 30%)",
  },
  fiestaspatrias: {
    shapes: [
      { type: "circle", colors: ["#006847", "#CE1126"] },
      { type: "star", colors: ["#FFD700", "#FFFFFF"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(10,45,26,0.15) 0%, transparent 30%)",
  },
  semanasanta: {
    shapes: [
      { type: "petal", colors: ["#7B2D8E", "#E8A838"] },
      { type: "circle", colors: ["#4A0E6B", "#7B2D8E"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(26,26,46,0.15) 0%, transparent 30%)",
  },
  anonuevo: {
    shapes: [
      { type: "star", colors: ["#FFD700", "#C0C0C0"] },
      { type: "circle", colors: ["#FFFFFF", "#FFD700"] },
      { type: "diamond", colors: ["#C0C0C0"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(10,10,46,0.12) 0%, transparent 30%)",
  },
  feriahuamantla: {
    shapes: [
      { type: "petal", colors: ["#FF4081", "#FFD740"] },
      { type: "circle", colors: ["#E91E63", "#FFD740"] },
      { type: "diamond", colors: ["#FF4081"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(26,10,46,0.15) 0%, transparent 30%)",
  },
  halloween: {
    shapes: [
      { type: "circle", colors: ["#FF6D00", "#7C4DFF"] },
      { type: "diamond", colors: ["#212121", "#FF6D00"] },
      { type: "drop", colors: ["#7C4DFF"] },
    ],
    bgOverlay: "linear-gradient(180deg, rgba(10,10,10,0.25) 0%, transparent 30%)",
  },
};

const SHAPE_STYLES: Record<Shape, React.CSSProperties> = {
  circle: { borderRadius: "50%" },
  star: {
    clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    borderRadius: 0,
  },
  petal: { borderRadius: "50% 0 50% 0" },
  diamond: {
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    borderRadius: 0,
  },
  drop: { borderRadius: "0 50% 50% 50%", transform: "rotate(45deg)" },
};

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  shape: Shape;
  isGlow: boolean;
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

    const allShapes = theme.shapes.flatMap((s) =>
      s.colors.map((c) => ({ type: s.type, color: c }))
    );

    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => {
      const pick = allShapes[i % allShapes.length];
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        size: 8 + Math.random() * 10,
        color: pick.color,
        shape: pick.type,
        isGlow: Math.random() > 0.6,
      };
    });

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
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: p.isGlow ? `0 0 ${p.size * 1.5}px ${p.color}80` : "none",
              ...SHAPE_STYLES[p.shape],
              animationName: "festivity-fall",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: "ease-in",
              animationIterationCount: 1,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes festivity-fall {
          0%   { transform: translateY(-20px); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}
