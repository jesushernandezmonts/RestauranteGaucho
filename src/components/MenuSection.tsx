"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  IconPlate, IconMeat, IconPasta, IconPizza, IconSoup,
  IconDrink, IconCocktail, IconBread, IconSalad, IconFlame,
} from "./GauchoIcons";

type Categoria = {
  id: number;
  nombre: string;
  icono: string;
  platillos: { id: number; nombre: string; descripcion: string; precio: number }[];
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

export function MenuSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchMenu() {
      try {
        const res = await fetch("/api/platillos", { cache: "no-store" });
        if (!mounted) return;
        const data = await res.json();
        setCategorias(data);
        setLoading(false);
      } catch (e) { console.error(e); }
    }
    fetchMenu();
    // Refetch on window focus (admin tab changes)
    const onFocus = () => { setLoading(true); fetchMenu(); };
    window.addEventListener("focus", onFocus);
    // Auto-refresh every 30s
    const interval = setInterval(fetchMenu, 30000);
    return () => { mounted = false; window.removeEventListener("focus", onFocus); clearInterval(interval); };
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
                <div
                  key={platillo.id}
                  className="group flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-white/60 border border-chocolate/5 hover:border-gold/20 transition-all duration-300 hover:shadow-gold animate-reveal"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-chocolate group-hover:text-gold-dark transition-colors">
                      {platillo.nombre}
                    </h3>
                    {platillo.descripcion && (
                      <p className="text-xs sm:text-sm text-chocolate-light mt-1 leading-relaxed">{platillo.descripcion}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-bold text-gold-dark text-sm sm:text-base">${platillo.precio}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
