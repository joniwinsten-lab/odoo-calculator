// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Quote Calculator",
  description: "Odoo-style calculator clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-wave-dark text-white">
        {children}
      </body>
    </html>
  );
}
