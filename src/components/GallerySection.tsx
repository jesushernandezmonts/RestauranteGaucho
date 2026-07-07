"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    alt: "Parrilla argentina con cortes de carne",
    label: "Parrilla",
  },
  {
    src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    alt: "Interior del restaurante",
    label: "Ambiente",
  },
  {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    alt: "Plato gourmet servido",
    label: "Platillos",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    alt: "Carne a la parrilla con guarniciones",
    label: "Cortes",
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Plato de pasta artesanal",
    label: "Pastas",
  },
  {
    src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    alt: "Bebidas y cócteles",
    label: "Bebidas",
  },
];

export function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const next = () => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % images.length);
    }
  };

  const prev = () => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <section id="galeria" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-primary-light mb-4">
            <span className="text-sm">📸</span>
            <span>Galería</span>
          </div>
          <h2 className="section-title">Descubre Nuestro Mundo</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Un vistazo a la experiencia Gaucho: sabores, ambiente y tradición.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`group relative overflow-hidden rounded-2xl ${
                idx === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <div className="aspect-[4/3]">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3">
                  <span className="text-sm font-medium bg-primary/80 px-3 py-1 rounded-full">
                    {img.label}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveIndex(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-surface-light transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-surface-light transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
          <img
            src={images[activeIndex].src}
            alt={images[activeIndex].alt}
            className="max-h-[85vh] max-w-full object-contain rounded-2xl"
          />
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-surface-light transition-colors text-lg"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
