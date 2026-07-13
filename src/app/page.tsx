import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { MenuWrapper } from "@/components/MenuWrapper";
import { GallerySection } from "@/components/GallerySection";
import { ContactSection } from "@/components/ContactSection";
import { prisma } from "@/lib/prisma";

async function getConfig() {
  try {
    const configs = await prisma.configuracion.findMany();
    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.clave] = c.valor;
    }
    return map;
  } catch (error) {
    console.error("Error fetching config server-side:", error);
    return {};
  }
}

export default async function Home() {
  const config = await getConfig();
  return (
    <>
      <HeroSection initialConfig={config} />
      <AboutSection initialConfig={config} />
      <MenuWrapper />
      <GallerySection />
      <ContactSection />
    </>
  );
}
