import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { MenuWrapper } from "@/components/MenuWrapper";
import { GallerySection } from "@/components/GallerySection";
import { ContactSection } from "@/components/ContactSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MenuWrapper />
      <GallerySection />
      <ContactSection />
      <WhatsAppButton />
    </>
  );
}
