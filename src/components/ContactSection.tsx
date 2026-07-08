"use client";

export function ContactSection() {
  return (
    <section id="contacto" className="py-14 sm:py-20 md:py-28 bg-cream-warm/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-badge">Contacto</span>
          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-bold text-chocolate leading-tight">
            Visítanos
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-5">
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="block w-8 sm:w-14 md:w-20 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Dirección */}
          <a
            href="https://maps.google.com/?q=C.+Juárez+Nte.+215+Huamantla+Tlaxcala"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 sm:p-8 rounded-2xl bg-white/60 border border-chocolate/5 hover:border-gold/20 transition-all duration-300 hover:shadow-gold text-center"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/30 transition-colors">
              <svg className="w-5 h-5 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-display text-base sm:text-lg font-semibold text-chocolate mb-2">Ubicación</h3>
            <p className="text-sm text-chocolate-light">
              C. Juárez Nte. 215<br />
              Huamantla, Tlaxcala
            </p>
          </a>

          {/* Teléfono */}
          <a
            href="https://wa.me/5212472055070"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 sm:p-8 rounded-2xl bg-white/60 border border-chocolate/5 hover:border-gold/20 transition-all duration-300 hover:shadow-gold text-center"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/30 transition-colors">
              <svg className="w-5 h-5 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-display text-base sm:text-lg font-semibold text-chocolate mb-2">Teléfono</h3>
            <p className="text-sm text-chocolate-light">247 205 5070</p>
          </a>

          {/* Horarios */}
          <div className="group p-6 sm:p-8 rounded-2xl bg-white/60 border border-chocolate/5 hover:border-gold/20 transition-all duration-300 hover:shadow-gold text-center">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/30 transition-colors">
              <svg className="w-5 h-5 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-base sm:text-lg font-semibold text-chocolate mb-2">Horarios</h3>
            <p className="text-sm text-chocolate-light">
              Lun - Vie: 1:00 PM - 11:00 PM<br />
              Sáb - Dom: 12:00 PM - 12:00 AM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
