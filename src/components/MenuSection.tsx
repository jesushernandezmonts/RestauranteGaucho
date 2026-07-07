"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface Platillo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  platillos: Platillo[];
}

export function MenuSection({ categorias }: { categorias: Categoria[] }) {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  const filtered = categorias
    .map((cat) => ({
      ...cat,
      platillos: cat.platillos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(search.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.platillos.length > 0 || search === "");

  const toggleCat = (id: number) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  return (
    <section id="menu" className="py-20 md:py-32 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-primary-light mb-4">
            <span className="text-sm">🍽️</span>
            <span>Carta</span>
          </div>
          <h2 className="section-title">Nuestro Menú</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Cortes premium, pastas artesanales y los sabores más auténticos de
            la parrilla argentina.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar platillo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 transition-all duration-200"
          />
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="card overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icono}</span>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary">
                    {cat.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span>{cat.platillos.length} platillos</span>
                  {expandedCat === cat.id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </button>

              {/* Platillos */}
              {expandedCat === cat.id && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-down">
                  {cat.platillos.map((platillo) => (
                    <div
                      key={platillo.id}
                      className="group flex items-start justify-between p-4 rounded-xl bg-surface-light/50 hover:bg-surface-light border border-primary/5 hover:border-primary/15 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-semibold text-text-primary group-hover:text-primary-light transition-colors">
                          {platillo.nombre}
                        </h4>
                        {platillo.descripcion && (
                          <p className="text-sm text-text-muted mt-1 line-clamp-2">
                            {platillo.descripcion}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-primary-light whitespace-nowrap">
                        ${platillo.precio}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* If not expanded, show mini preview */}
              {expandedCat !== cat.id && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat.platillos.slice(0, 5).map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-light/50 text-xs text-text-secondary"
                    >
                      {p.nombre}
                      <span className="text-primary-light font-medium">
                        ${p.precio}
                      </span>
                    </span>
                  ))}
                  {cat.platillos.length > 5 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-xs text-primary-light">
                      +{cat.platillos.length - 5} más
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">
              No se encontraron platillos con &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
