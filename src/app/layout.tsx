import "./globals.css";
import type { Metadata } from "next";
import BackgroundRain from "@/components/BackgroundRain";

export const metadata: Metadata = {
  title: "Website Quote Calculator",
  description: "Odoo-style calculator clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="relative min-h-screen text-white">
          {/* Animoitu tumma sade-tausta (canvas) */}
          <BackgroundRain
            density={1.00}          // enemmän/vähemmän pisaroita
            speed={1.2}             // perusnopeus
            wind={0.1}              // kevyt tuuli oikealle
            color="rgba(255,255,255,0.08)"
            background="radial-gradient(1100px 700px at 12% 10%, #2b2b2b 0%, #1a1a1a 40%, #0e0e0e 100%)"
            blurPx={1.2}            // sumu/pehmeys (0 = pois)
            flashProbability={0.018} // harvinainen salama (~1.8%/s)
            flashColor="rgba(255,255,255,0.9)"
            flashMaxAlpha={0.22}
          />

          {/* Sivun varsinainen sisältö */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
