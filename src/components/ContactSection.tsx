import { MapPin, Phone, Clock, Mail } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-primary-light mb-4">
            <span className="text-sm">📍</span>
            <span>Contacto</span>
          </div>
          <h2 className="section-title">Visítanos</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Te esperamos para vivir una experiencia gastronómica única.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-primary/10 h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.5!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzU3LjQiTiA5OcKwMDcnNTkuNSJX!5e0!3m2!1ses!2smx!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del restaurante"
              className="grayscale brightness-50 hover:grayscale-0 transition-all duration-500"
            />
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            {[
              {
                icon: MapPin,
                title: "Dirección",
                content: "Av. Principal 123, Col. Centro\nCiudad de México, CDMX",
              },
              {
                icon: Phone,
                title: "Teléfono",
                content: "(555) 123-4567",
                href: "tel:+525551234567",
              },
              {
                icon: Mail,
                title: "Email",
                content: "info@gauchorestaurante.com",
                href: "mailto:info@gauchorestaurante.com",
              },
              {
                icon: Clock,
                title: "Horarios",
                content:
                  "Lun-Vie: 12:00 - 23:00\nSáb: 11:00 - 00:00\nDom: 11:00 - 22:00",
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={22} className="text-primary-light" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">
                      {item.title}
                    </h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-text-secondary hover:text-primary-light transition-colors whitespace-pre-line"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-text-secondary whitespace-pre-line">
                        {item.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
