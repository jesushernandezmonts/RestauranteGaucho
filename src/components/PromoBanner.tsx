"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useFestividad } from "../hooks/useFestividad";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";

type Promocion = {
  id: number;
  titulo: string;
  descripcion: string;
  descuento: string;
  categoria: string;
  plateado?: boolean;
  activo: boolean;
};

export function PromoBanner() {
  const { esFestividad } = useFestividad();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indiceActual, setIndiceActual] = useState(0);
  const [visible, setVisible] = useState(false);

  // Revisar si el usuario ya cerró el banner
  useEffect(() => {
    const cerrado = localStorage.getItem("gaucho_promo_cerrado");
    if (cerrado !== "true") {
      setVisible(true);
    }
  }, []);

  const getHuamantlaColors = () => {
    return {
      primary: "#FF4081", // Primary from Huamantla (already fixed)
      secondary: "#FFD740", // Accent from Huamantla
      bg: "#1A0A2E", // Dark bg from Huamantla
      text: "#F5E6F5", // Light text from Huamantla
    };
  };

  const colors = getHuamantlaColors();

  // Cargar promociones desde la API
  useEffect(() => {
    const cargarPromociones = async () => {
      try {
        setCargando(true);
        // Simular llamada a API - en el caso real sería:
        // const res = await fetch('/api/promociones');
        // const data = await res.json();
        // setPromociones(data);

        // Datos de ejemplo que coinciden con el estilo del proyecto
        const datosEjemplo: Promocion[] = [
          {
            id: 1,
            titulo: "¡15% OFF!",
            descripcion: "En todos los ticos de la casa",
            descuento: "15% OFF",
            categoria: "entrada",
            plateado: true,
            activo: true,
          },
          {
            id: 2,
            titulo: "¡2x1!",
            descripcion: "En cervezas seleccionadas",
            descuento: "2x1",
            categoria: "bebida",
            plateado: false,
            activo: true,
          },
          {
            id: 3,
            titulo: "¡3x2!",
            descripcion: "En mariscos los viernes",
            descuento: "3x2",
            categoria: "plato principal",
            plateado: true,
            activo: true,
          },
        ];

        setPromociones(datosEjemplo);
        setError(null);
      } catch (err) {
        console.error('Error cargando promociones:', err);
        setError('Error al cargar promociones');
      } finally {
        setCargando(false);
      }
    };

    cargarPromociones();
  }, []);

  // Auto-avanzar el carrusel
  useEffect(() => {
    if (promociones.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promociones.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(intervalo);
  }, [promociones.length]);

  const promocionesActivas = promociones.filter((p) => p.activo);

  if (!esFestividad || promocionesActivas.length === 0 || !visible) return null;

  const promocionActual = promocionesActivas[indiceActual];

  const irAlAnterior = () => {
    setIndiceActual((prev) => (prev - 1 + promocionesActivas.length) % promocionesActivas.length);
  };

  const irAlSiguiente = () => {
    setIndiceActual((prev) => (prev + 1) % promocionesActivas.length);
  };

  if (cargando) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
        <Loader2 className="animate-spin" size={24} style={{ color: colors.primary }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-red-500/20 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-red-500/30">
        <p className="text-white" style={{ color: colors.text }}>{error}</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-40 max-w-sm w-full mx-auto"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className="relative rounded-3xl p-6 shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.bg}e6, ${colors.bg}cc)`,
            border: `1px solid ${colors.primary}40`,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Efecto de brillo de fiesta */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `linear-gradient(45deg, transparent, ${colors.secondary}30, transparent)`,
              animation: 'shimmer 3s infinite',
            }}
          />

          {/* Indicador de cierre */}
          <button
            onClick={() => {
              setVisible(false);
              localStorage.setItem("gaucho_promo_cerrado", "true");
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 z-10"
            style={{
              backdropFilter: 'blur(8px)',
              border: `1px solid ${colors.primary}30`,
            }}
          >
            <X size={16} style={{ color: colors.text }} />
          </button>

          {/* Contenido del carrusel */}
          <div className="relative z-10">
            <div className="text-center mb-4">
              <h3
                className="font-display text-xl font-bold mb-1"
                style={{ color: colors.primary }}
              >
                {promocionActual.titulo}
              </h3>
              <p
                className="text-sm font-medium"
                style={{ color: colors.text, opacity: 0.9 }}
              >
                {promocionActual.descripcion}
              </p>
            </div>

            <div
              className="text-center mb-4 p-3 rounded-2xl"
              style={{
                background: promocionActual.plateado
                  ? `linear-gradient(135deg, ${colors.secondary}40, ${colors.primary}20)`
                  : `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}20)`,
                border: `1px solid ${promocionActual.plateado ? colors.secondary : colors.primary}50`,
              }}
            >
              <span
                className="font-display text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {promocionActual.descuento}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={irAlAnterior}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                style={{
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                <ChevronLeft size={20} style={{ color: colors.text }} />
              </button>

              <div className="flex space-x-2">
                {promocionesActivas.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setIndiceActual(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === indiceActual ? 'w-8' : ''}`}
                    style={{
                      backgroundColor: index === indiceActual ? colors.primary : colors.text,
                      opacity: index === indiceActual ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={irAlSiguiente}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                style={{
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                <ChevronRight size={20} style={{ color: colors.text }} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href="#menu"
                className="block w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: colors.bg,
                  boxShadow: `0 4px 14px ${colors.primary}40`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Ver en el menú
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
