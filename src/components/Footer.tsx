"use client";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/60 relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-0 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <span className="text-3xl">🥩</span>
              <span className="font-script text-xl sm:text-2xl text-gold">Gaucho</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40 mb-4 sm:mb-5 max-w-xs">
              Donde la tradición gaucha se encuentra con la más alta cocina y hospitalidad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5">Enlaces rápidos</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { href: "/", label: "Inicio" },
                { href: "/#menu", label: "Menú" },
                { href: "/#galeria", label: "Galería" },
                { href: "/reservacion", label: "Reservación" },
                { href: "/#contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/40 hover:text-gold transition-all duration-200 hover:pl-1 block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5">Horarios</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li className="text-sm text-white/40">Lun - Vie: 1:00 PM - 11:00 PM</li>
              <li className="text-sm text-white/40">Sáb - Dom: 12:00 PM - 12:00 AM</li>
              <li className="text-sm text-white/30 mt-3">📞 247 205 5070</li>
            </ul>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="font-display text-white text-sm sm:text-base mb-4 sm:mb-5">Ubicación</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              C. Juárez Nte. 215<br />
              Huamantla, Tlaxcala<br />
              México
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 py-4 sm:py-5 text-[11px] sm:text-xs text-white/25">
          <span>&copy; 2026 Gaucho Restaurante. Todos los derechos reservados.</span>
          <span>Hecho con <svg className="w-3 h-3 inline text-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> para vos</span>
        </div>
      </div>
    </footer>
  );
}
