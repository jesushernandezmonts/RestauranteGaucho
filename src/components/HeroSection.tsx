export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(61,42,28,0.92) 0%, rgba(74,50,40,0.7) 50%, rgba(61,42,28,0.92) 100%), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80')",
      }}
    >
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(#E8AB2F 1px, transparent 1px)", backgroundSize: "50px 50px" }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(232,171,47,0.12)_0%,_transparent_65%)]" />

      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-4xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[100dvh] py-16 sm:py-20 md:py-24">
        {/* Floating Logo */}
        <div className="animate-float mb-4 sm:mb-5 md:mb-6 inline-block">
          <span className="text-7xl sm:text-8xl md:text-9xl">🥩</span>
        </div>

        <p className="text-white/60 text-[10px] sm:text-xs md:text-sm tracking-[4px] sm:tracking-[6px] uppercase font-medium mb-1 sm:mb-2">
          Bienvenido a
        </p>
        <h1 className="font-script text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-gold leading-tight mb-1 sm:mb-2 drop-shadow-[0_4px_15px_rgba(232,171,47,0.2)]">
          Gaucho
        </h1>
        <p className="font-display text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 tracking-wide mb-1 sm:mb-2">
          Restaurante &amp; Parrilla
        </p>
        <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm md:max-w-lg mx-auto font-light px-4">
          Donde la tradición gaucha se encuentra con la más alta cocina
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-sm sm:max-w-none mx-auto">
          <a
            href="/reservacion"
            className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-chocolate font-bold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-gold-lg text-sm sm:text-base w-full"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Reservar Ahora
          </a>
          <a
            href="#menu"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white hover:bg-white/10 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base font-medium w-full"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Ver Menú
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 text-white/30 text-[9px] sm:text-[10px] tracking-[3px] uppercase animate-scroll">
          <span className="hidden sm:inline">Descubre</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>
    </section>
  );
}
