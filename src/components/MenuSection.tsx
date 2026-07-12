"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  IconPlate, IconMeat, IconPasta, IconPizza, IconSoup,
  IconDrink, IconCocktail, IconBread, IconSalad, IconFlame,
} from "./GauchoIcons";

type Categoria = {
  id: number;
  nombre: string;
  icono: string;
  platillos: { id: number; nombre: string; descripcion: string; precio: number; imagen?: string; ingredientesDestacados?: string }[];
};

type Platillo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  ingredientesDestacados?: string;
};

const iconMap: Record<string, React.ReactNode> = {
  "🥞": <IconBread />,
  "🇲🇽": <IconFlame />,
  "🍝": <IconPasta />,
  "🍕": <IconPizza />,
  "🥣": <IconSoup />,
  "🥩": <IconMeat />,
  "🥦": <IconPlate />,
  "🥪": <IconBread />,
  "🥗": <IconSalad />,
  "🥤": <IconDrink />,
  "🍹": <IconCocktail />,
};

function DishModal({ platillo, onClose }: { platillo: Platillo; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Parse ingredients from comma-separated string
  const ingredientes = platillo.ingredientesDestacados
    ? platillo.ingredientesDestacados.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-cream rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {platillo.imagen ? (
          <div className="relative w-full h-64 sm:h-80 bg-chocolate/5">
            <img
              src={platillo.imagen}
              alt={platillo.nombre}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gradient-to-br from-gold/10 to-sage/10 flex items-center justify-center">
            <IconPlate />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-chocolate mb-2">
            {platillo.nombre}
          </h3>

          {platillo.descripcion && (
            <p className="text-sm sm:text-base text-chocolate-light leading-relaxed mb-5">
              {platillo.descripcion}
            </p>
          )}

          {/* Ingredients */}
          {ingredientes.length > 0 && (
            <div className="mb-5">
              <span className="text-xs font-semibold tracking-widest uppercase text-sage-dark mb-2 block">
                Ingredientes destacados
              </span>
              <div className="flex flex-wrap gap-2">
                {ingredientes.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/15 text-chocolate text-xs sm:text-sm font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price & close */}
          <div className="flex items-center justify-between pt-4 border-t border-chocolate/10">
            <span className="font-display text-2xl font-bold text-gold-dark">
              ${platillo.precio}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gold text-chocolate font-semibold text-sm hover:bg-gold-light transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [selectedPlatillo, setSelectedPlatillo] = useState<Platillo | null>(null);

  useEffect(() => {
    let mounted = true;
    let version = 0;

    async function fetchMenu() {
      try {
        const res = await fetch("/api/platillos", { cache: "no-store" });
        if (!mounted) return;
        const data = await res.json();
        setCategorias(data);
        setLoading(false);
      } catch (e) { console.error(e); }
    }

    async function checkVersion() {
      try {
        const res = await fetch(`/api/menu-version?v=${version}`, { cache: "no-store" });
        if (!mounted) return;
        const data = await res.json();
        if (data.changed) {
          version = data.current;
          fetchMenu();
        }
      } catch {}
    }

    fetchMenu();

    // Cross-tab instant sync
    const channel = new BroadcastChannel("gaucho_menu_changes");
    channel.onmessage = () => fetchMenu();

    // Lightweight version poll every 3 seconds (cross-device)
    const interval = setInterval(checkVersion, 3000);

    // Refetch on window focus
    const onFocus = () => { checkVersion(); };
    window.addEventListener("focus", onFocus);

    return () => { mounted = false; channel.close(); clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  // Set initial active category when data first loads
  useEffect(() => {
    if (categorias.length > 0 && activeCat === null) {
      setActiveCat(categorias[0].id);
    }
  }, [categorias, activeCat]);

  const currentCat = categorias.find((c) => c.id === activeCat);

  return (
    <section id="menu" className="py-14 sm:py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream-warm/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-10">
          <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-[3px] uppercase text-sage-dark bg-sage/20 px-2.5 sm:px-4 py-1 sm:py-2 rounded-full mb-2 sm:mb-4">Menú</span>
          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-bold text-chocolate leading-tight tracking-tight">
            Nuestros Platillos
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-5">
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeCat === cat.id
                  ? "bg-gold text-chocolate shadow-gold"
                  : "bg-white/60 text-chocolate-light hover:bg-gold/20 border border-chocolate/10"
              }`}
            >
              <span className="w-4 h-4">{iconMap[cat.icono] || <IconPlate />}</span>
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Active category dishes */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gold" /></div>
        ) : currentCat ? (
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-3 sm:gap-4">
              {currentCat.platillos.map((platillo, i) => (
                <button
                  key={platillo.id}
                  onClick={() => setSelectedPlatillo(platillo)}
                  className="group flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-white/60 border border-chocolate/5 hover:border-gold/20 transition-all duration-300 hover:shadow-gold animate-reveal text-left w-full cursor-pointer"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {platillo.imagen && (
                      <img
                        src={platillo.imagen}
                        alt={platillo.nombre}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0 border border-chocolate/5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base sm:text-lg font-semibold text-chocolate group-hover:text-gold-dark transition-colors">
                        {platillo.nombre}
                      </h3>
                      {platillo.descripcion && (
                        <p className="text-xs sm:text-sm text-chocolate-light mt-1 leading-relaxed line-clamp-2">{platillo.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 font-bold text-gold-dark text-sm sm:text-base">${platillo.precio}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Dish Detail Modal */}
      {selectedPlatillo && (
        <DishModal platillo={selectedPlatillo} onClose={() => setSelectedPlatillo(null)} />
      )}
    </section>
  );
}
