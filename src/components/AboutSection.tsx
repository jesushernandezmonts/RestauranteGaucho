"use client";

import { useEffect, useRef, useState } from "react";

export function AboutSection() {
  const statsRef = useRef<HTMLDivElement>(null);
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

  function animateCounter(el: HTMLElement, target: number) {
    const steps = 60, duration = 2000;
    const inc = target / steps;
    let step = 0, current = 0;
    const timer = setInterval(() => {
      step++;
      current += inc;
      if (step >= steps) { el.textContent = target + "+"; clearInterval(timer); }
      else { el.textContent = Math.round(current).toString(); }
    }, duration / steps);
  }

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = el.querySelectorAll("[data-count]");
            targets.forEach((t) => {
              const target = parseInt((t as HTMLElement).dataset.count || "0");
              if (!(t as HTMLElement).dataset.counted) {
                (t as HTMLElement).dataset.counted = "true";
                animateCounter(t as HTMLElement, target);
              }
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const aboutImage = config.about_imagen || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80";

  return (
    <section id="nosotros" className="py-14 sm:py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8 sm:mb-14 md:mb-18">
          <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-[3px] uppercase text-sage-dark bg-sage/20 px-2.5 sm:px-4 py-1 sm:py-2 rounded-full mb-2 sm:mb-4">
            Nuestra Historia
          </span>
          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-bold text-chocolate leading-tight">Tradición que trasciende</h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-5">
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-center">
          <div className="relative order-2 md:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              {loaded ? (
                <img
                  src={aboutImage}
                  alt="Gaucho Restaurante"
                  loading="lazy"
                  className="w-full h-[220px] sm:h-[320px] md:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-[220px] sm:h-[320px] md:h-[460px] bg-chocolate/10 animate-pulse rounded-2xl" />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-chocolate/20 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-gold/30 rounded-2xl -z-10 hidden md:block" />
          </div>

          <div className="order-1 md:order-2">
            <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-chocolate mb-3 sm:mb-5">
              El espíritu gaucho en cada detalle
            </h3>
            <div className="space-y-2 sm:space-y-4 text-chocolate-light leading-relaxed text-sm sm:text-[15px] md:text-base">
              <p>
                En <strong className="text-chocolate">Gaucho Restaurante</strong>, celebramos la rica herencia de la cultura argentina
                a través de una experiencia culinaria sin igual. Ofrecemos los cortes de carne
                más selectos, acompañados de los mejores vinos.
              </p>
              <p>
                Cada plato cuenta una historia, transportándote a las vastas llanuras de la
                Patagonia, donde el cielo se encuentra con la tierra y el tiempo parece detenerse.
              </p>
            </div>

            <div ref={statsRef} className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-8 pt-4 sm:pt-8 border-t border-chocolate/10">
              {[
                { count: 15, label: "Años de tradición" },
                { count: 68, label: "Platos exclusivos" },
                { count: 12, label: "Cortes premium" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gold block leading-none" data-count={s.count}>0</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-chocolate-light font-medium mt-1 sm:mt-1.5 block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
