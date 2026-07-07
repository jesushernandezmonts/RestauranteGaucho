import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Gaucho Restaurante | Parrilla Argentina",
    template: "%s | Gaucho Restaurante",
  },
  description:
    "Descubre Gaucho Restaurante, la mejor parrilla argentina. Cortes premium, pastas artesanales y una experiencia gastronómica única.",
  keywords: [
    "gaucho",
    "restaurante",
    "parrilla argentina",
    "cortes",
    "t-bone",
    "rib eye",
    "pizza",
    "pastas",
  ],
  authors: [{ name: "Gaucho Restaurante" }],
  creator: "Gaucho Restaurante",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Gaucho Restaurante",
    title: "Gaucho Restaurante | Parrilla Argentina",
    description:
      "La mejor parrilla argentina. Cortes premium, pastas artesanales y experiencia única.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0f0a07" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (reg) => console.log('SW registered:', reg.scope),
                    (err) => console.log('SW registration failed:', err)
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
