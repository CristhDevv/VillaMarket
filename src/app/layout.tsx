import { Providers } from "@/app/providers";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: 'VillaMarket — Directorio de negocios de Villa Rica, Cauca',
    template: '%s | VillaMarket'
  },
  description: 'Encuentra y apoya los negocios locales de Villa Rica, Cauca. Restaurantes, tiendas, servicios y más.',
  keywords: ['Villa Rica', 'Cauca', 'negocios locales', 'directorio', 'Colombia'],
  authors: [{ name: 'VillaMarket' }],
  creator: 'VillaMarket',
  metadataBase: new URL('https://villamarket.co'),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'VillaMarket',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1B4332',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
