import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-primary/10 bg-accent">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🥩</span>
              <span className="font-display text-2xl font-bold text-gradient">
                Gaucho
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              La mejor parrilla argentina con cortes premium, pastas artesanales
              y una experiencia gastronómica inigualable.
            </p>
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-primary-light">
              Horarios
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p className="flex justify-between">
                <span>Lunes - Viernes</span>
                <span className="text-text-primary font-medium">12:00 - 23:00</span>
              </p>
              <p className="flex justify-between">
                <span>Sábado</span>
                <span className="text-text-primary font-medium">11:00 - 00:00</span>
              </p>
              <p className="flex justify-between">
                <span>Domingo</span>
                <span className="text-text-primary font-medium">11:00 - 22:00</span>
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-primary-light">
              Contacto
            </h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <p className="flex items-start gap-3">
                <span>📍</span>
                <span>Av. Principal 123, Col. Centro, México</span>
              </p>
              <p className="flex items-center gap-3">
                <span>📞</span>
                <a
                  href="tel:+525551234567"
                  className="hover:text-primary-light transition-colors"
                >
                  (555) 123-4567
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span>📧</span>
                <a
                  href="mailto:info@gauchorestaurante.com"
                  className="hover:text-primary-light transition-colors"
                >
                  info@gauchorestaurante.com
                </a>
              </p>
            </div>
            {/* Social */}
            <div className="flex gap-4 pt-2">
              {[
                { icon: "📸", label: "Instagram", href: "#" },
                { icon: "👍", label: "Facebook", href: "#" },
                { icon: "🐦", label: "Twitter", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface hover:bg-surface-lighter border border-primary/10 hover:border-primary/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <p>&copy; {year} Gaucho Restaurante. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-text-secondary transition-colors">
              Aviso de Privacidad
            </Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
