
import type { Metadata } from "next";
import { Playfair_Display, Pacifico } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";
import { AuthProvider } from "@/components/AuthProvider";
import { FestividadProvider } from "@/contexts/FestividadContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const playfairDisplay = Playfair_Display({
  variable: "--font-display-family",
  subsets: ["latin"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-script-family",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

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
    <html lang="es-MX" className={`${playfairDisplay.variable} ${pacifico.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#1D0A0A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <FestividadProvider>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </FestividadProvider>
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
