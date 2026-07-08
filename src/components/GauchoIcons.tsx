// SVG Icons elegantes para Gaucho Restaurante
// Reemplazan emojis por iconos SVG premium

export function GauchoLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sombrero gaucho estilizado */}
      <ellipse cx="20" cy="30" rx="16" ry="3" className="fill-gold/40" />
      <path d="M6 20C6 12 10 6 20 6s14 6 14 14" className="stroke-gold" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20c0 4 3 8 5 10" className="stroke-gold/60" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 20c0 4-3 8-5 10" className="stroke-gold/60" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20c0 3 2 5 3 6" className="stroke-gold/40" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 20c0 3-2 5-3 6" className="stroke-gold/40" strokeWidth="1.5" strokeLinecap="round" />
      {/* Estrella/Cruz del Sur */}
      <circle cx="17" cy="12" r="1.5" className="fill-gold" />
      <circle cx="23" cy="10" r="1" className="fill-gold/70" />
      <circle cx="20" cy="15" r="1" className="fill-gold/50" />
      <circle cx="21" cy="8" r="0.8" className="fill-gold/30" />
    </svg>
  );
}

export function IconPlate({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconMeat({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 4c-2 0-4 1-5 3-1-2-3-3-5-3-3 0-5 2.5-5 6s2 6 5 6c2 0 4-1 5-3 1 2 3 3 5 3 3 0 5-2.5 5-6s-2-6-5-6z" />
      <path d="M7 16c-2 1-3 3-3 5" />
      <path d="M17 16c2 1 3 3 3 5" />
    </svg>
  );
}

export function IconPasta({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c-4 0-8-2-8-6v-2c0-2 2-4 8-4s8 2 8 4v2c0 4-4 6-8 6z" />
      <path d="M12 10V6" /><path d="M10 5v2" /><path d="M14 5v2" />
      <path d="M8 7c0-2 2-3 4-3s4 1 4 3" />
      <path d="M14 18c-4 0-6-1-6-2" />
    </svg>
  );
}

export function IconSoup({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11c0-3 2-7 8-7s8 4 8 7" />
      <path d="M4 11c0 4 4 6 8 6s8-2 8-6" />
      <path d="M4 11h16" />
      <path d="M8 3l2 3" /><path d="M12 3l2 3" /><path d="M16 3l2 3" />
    </svg>
  );
}

export function IconPizza({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 20h20L12 2z" />
      <circle cx="12" cy="14" r="2" />
      <circle cx="8" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1" />
    </svg>
  );
}

export function IconDrink({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14l-2 12H7L5 3z" />
      <path d="M8 15v4a2 2 0 002 2h4a2 2 0 002-2v-4" />
      <path d="M8 3l1 2h6l1-2" />
    </svg>
  );
}

export function IconCocktail({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h2l-4 6h-2" />
      <path d="M6 8h2l4 6h-2" />
      <path d="M12 14v6" />
      <path d="M9 20h6" />
      <path d="M10 4l2 2 2-2" />
      <path d="M3 8c0 3 3 5 9 5s9-2 9-5" />
    </svg>
  );
}

export function IconBread({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12a4 4 0 010 8H6a4 4 0 010-8z" />
      <path d="M8 12v6c0 1.1.9 2 2 2h4a2 2 0 002-2v-6" />
    </svg>
  );
}

export function IconSalad({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-2 0-4 1-4 4 0 2 1 4 4 7 3-3 4-5 4-7 0-3-2-4-4-4z" />
      <path d="M8 7c-2 1-4 3-4 6 0 4 4 7 8 8" />
      <path d="M16 7c2 1 4 3 4 6 0 4-4 7-8 8" />
      <path d="M3 22c2-2 5-3 9-3s7 1 9 3" />
    </svg>
  );
}

export function IconLocation({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

export function IconClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconWine({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l-1 10c0 3-3 5-3 5s-3-2-3-5L8 2z" />
      <path d="M12 17v5" />
      <path d="M9 22h6" />
      <path d="M10 7c2 1 2 3 0 4" />
    </svg>
  );
}

export function IconMenu({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
    </svg>
  );
}

export function IconFeather({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L16 8" /><path d="M14 4l6 6" />
      <path d="M19 9L9 19c-4 1-6 0-6 0s-1-2 0-6l10-10" />
    </svg>
  );
}

export function IconMapPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconStar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function IconChef({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 017.5 6a2 2 0 014 0 4 4 0 015.5 3c0 .77-.22 1.5-.6 2.13" />
      <path d="M12 17v-8" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function IconFlame({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C10 6 6 8 6 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-2.5-5-4-7" />
      <path d="M12 14c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
    </svg>
  );
}
