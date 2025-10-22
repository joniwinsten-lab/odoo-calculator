// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import BackgroundRipples from "@/components/BackgroundRipples";

export const metadata: Metadata = {
  title: "Website Quote Calculator",
  description: "Odoo-style calculator clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="relative min-h-screen text-white">
          <BackgroundRipples
            dropsPerSecond={2}      // ↑ enemmän osumia = elävämpi pinta
            dropStrength={1.4}        // renkaiden voimakkuus
            damping={0.987}           // hitaampi vaimeneminen
            resolutionScale={0.5}     // suorituskyky/terävyys
            tint="#101010"            // tumma sävylasi
            background="radial-gradient(1100px 700px at 12% 10%, #242424 0%, #141414 45%, #0c0c0c 100%)"
            lightDir={[0.6, -0.8]}    // valo yläoikealta
            respectReducedMotion={true}
          />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
