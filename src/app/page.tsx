import { HeroSection } from "@/components/HeroSection";
import { MenuWrapper } from "@/components/MenuWrapper";
import { GallerySection } from "@/components/GallerySection";
import { ContactSection } from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* About */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-surface to-charcoal" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-primary-light mb-4">
                <span className="text-sm">🥩</span>
                <span>Nosotros</span>
              </div>
              <h2 className="section-title">Tradición Argentina</h2>
              <p className="section-subtitle mb-6">
                Desde 2015, trayendo el auténtico sabor de la parrilla
                argentina a México.
              </p>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  En <strong className="text-text-primary">Gaucho Restaurante</strong>,
                  cada platillo es una celebración de la tradición culinaria
                  argentina. Nuestros cortes son seleccionados cuidadosamente y
                  preparados a la parrilla con técnicas heredadas de generación
                  en generación.
                </p>
                <p>
                  Desde nuestros waffles artesanales hasta los cortes T-Bone,
                  Rib Eye y Sirloin, cada bocado cuenta una historia de pasión
                  por la buena mesa.
                </p>
              </div>
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: "🥩", title: "Cortes Premium", desc: "Selección argentina" },
                  { icon: "🍝", title: "Pastas Artesanales", desc: "Hechas en casa" },
                  { icon: "🍷", title: "Barra de Vinos", desc: "Selección exclusiva" },
                  { icon: "🎵", title: "Música en vivo", desc: "Viernes y sábados" },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 p-4 rounded-xl bg-surface-light/50 border border-primary/5"
                  >
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">
                        {f.title}
                      </h4>
                      <p className="text-xs text-text-muted">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-primary/10">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
                  alt="Interior del restaurante Gaucho"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 card w-48 md:w-56 !p-4">
                <div className="text-2xl font-bold text-gradient">10+</div>
                <div className="text-xs text-text-muted mt-1">
                  Años de tradición culinaria
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MenuWrapper />
      <GallerySection />
      <ContactSection />
    </>
  );
}
