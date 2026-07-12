"use client";

import { useEffect, useState } from "react";

const DEFAULT_ITEMS = [
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", label: "Parrilla" },
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", label: "Ambiente" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", label: "Platillos" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", label: "Cortes" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", label: "Pastas", span: true },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", label: "Bar" },
  { src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", label: "Vinos" },
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", label: "Postres" },
];

export function GallerySection() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

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

  const items = DEFAULT_ITEMS.map((item, i) => {
    const idx = i + 1;
    return {
      src: config[`galeria_${idx}_img`] || item.src,
      label: config[`galeria_${idx}_label`] || item.label,
      span: item.span,
    };
  });

  return (
    <section id="galeria" className="py-14 sm:py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream-warm/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-10">
        <div className="text-center">
          <span className="section-badge">Galería</span>
          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-bold text-chocolate leading-tight">
            Capturamos momentos
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-5">
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 px-1 md:px-2">
        {items.map((img, i) => (
          <div
            key={img.label}
            className={`relative overflow-hidden rounded-lg cursor-pointer group ${
              img.span && "md:col-span-2 md:row-span-2"
            }`}
          >
            {loaded ? (
              <img
                src={img.src}
                alt={img.label}
                loading="lazy"
                className="w-full h-full min-h-[120px] sm:min-h-[180px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full min-h-[120px] sm:min-h-[180px] bg-chocolate/10 animate-pulse" />
            )}
            <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent items-end p-3 md:p-6 opacity-0 group-hover:opacity-100 transition-all duration-400">
              <span className="font-display text-white text-lg md:text-xl font-semibold translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                {img.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
