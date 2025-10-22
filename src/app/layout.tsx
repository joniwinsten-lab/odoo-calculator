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
          <BackgroundRain
            density={1.2}
            speed={1.2}
            wind={0.06}
            color="rgba(255,255,255,0.22)"
            coreColor="rgba(255,255,255,0.85)"
            background="radial-gradient(1100px 700px at 12% 10%, #242424 0%, #151515 45%, #0d0d0d 100%)"
            blurPx={0}
            flashProbability={0.03}
            flashColor="rgba(255,255,255,0.95)"
            flashMaxAlpha={0.28}
            respectReducedMotion={false}  // ohita OS:n liikerajoitus testiksi
          />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
