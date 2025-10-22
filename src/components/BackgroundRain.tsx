"use client";
import React, { useEffect, useRef } from "react";

/**
 * Tumma, suorituskykyinen sade-tausta canvasilla.
 * - Ei ulkoisia kirjastoja
 * - Lightning / flash -efekti
 * - Valinnainen blur (sumuisuus)
 * - Respektoi prefers-reduced-motion
 */
type Props = {
  /** Pisaroiden tiheys: ~0.3–1.2, oletus 0.7 */
  density?: number;
  /** Perusnopeuskerroin: 0.6–1.6, oletus 1.0 */
  speed?: number;
  /** Tuulen suunta/voimakkuus (neg=vasen, pos=oikea), suositus −0.3…0.3, oletus 0.12 */
  wind?: number;
  /** Pisaran väri (RGBA suositeltu) */
  color?: string;
  /** Taustan tumma gradientti */
  background?: string;
  /** CSS-blur pikseleinä koko taustalle (0 = pois), oletus 1.2 */
  blurPx?: number;

  /** Todennäköisyys/s (0–1), millä käynnistyy salama-välähdys, oletus 0.02 (= ~1/50 s) */
  flashProbability?: number;
  /** Salamavalon väri (RGBA), oletus rgba(255,255,255,0.85) */
  flashColor?: string;
  /** Salamavalon maksimi peittävyys 0–1, oletus 0.22 */
  flashMaxAlpha?: number;
};

export default function BackgroundRain({
  density = 0.7,
  speed = 1.0,
  wind = 0.12,
  color = "rgba(255,255,255,0.08)",
  background = "radial-gradient(1100px 700px at 12% 10%, #2b2b2b 0%, #1a1a1a 40%, #0e0e0e 100%)",
  blurPx = 1.2,
  flashProbability = 0.02,
  flashColor = "rgba(255,255,255,0.85)",
  flashMaxAlpha = 0.22,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;
    let running = true;

    const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    let w = 0, h = 0;

    type Drop = { x: number; y: number; vy: number; vx: number; len: number; thick: number; alpha: number };
    let drops: Drop[] = [];

    // salamavalon tila (laskee pehmeästi alas)
    let flashAlpha = 0;

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const makeDrop = (): Drop => {
      const baseVy = rand(480, 920) * speed; // px/s
      return {
        x: rand(0, w),
        y: rand(-h, h),
        vy: baseVy,
        vx: wind * rand(30, 70) * speed,
        len: rand(10, 22) * (baseVy / 700),
        thick: rand(0.8, 1.7),
        alpha: rand(0.25, 0.7),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const area = w * h;
      const targetCount = Math.floor((area / 10000) * density);
      drops = Array.from({ length: targetCount }, () => makeDrop());
    };

    const splash = (x: number, y: number, r: number, a: number) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(0.25, a));
      ctx.strokeStyle = color;
      ctx.lineWidth = r * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI, true);
      ctx.stroke();
      ctx.restore();
    };

    let last = performance.now();
    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.04, (now - last) / 1000); // cap ~40ms
      last = now;

      // satunnaiset salama-välähdykset (todennäköisyys / sekunti)
      if (Math.random() < flashProbability * dt) {
        flashAlpha = Math.min(flashMaxAlpha, flashAlpha + rand(0.12, flashMaxAlpha));
      }
      // fade-out salamasta
      flashAlpha *= Math.pow(0.35, dt); // nopea hiipuminen

      // tyhjennä
      ctx.clearRect(0, 0, w, h);

      // pisarat
      ctx.save();
      ctx.lineCap = "round";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.vy * dt;
        d.x += d.vx * dt;

        // wrap alas/ylös
        if (d.y - d.len > h) {
          if (Math.random() < 0.08) splash(d.x, h - 2, d.thick * 1.2, d.alpha * 0.8);
          drops[i] = makeDrop();
          drops[i].y = rand(-h * 0.5, -20);
        }
        if (d.x < -50) d.x = w + 50;
        if (d.x > w + 50) d.x = -50;

        ctx.globalAlpha = d.alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = d.thick;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 0.02, d.y - d.len);
        ctx.stroke();
      }
      ctx.restore();

      // salaman välähdys -peite
      if (flashAlpha > 0.001) {
        ctx.save();
        ctx.globalAlpha = flashAlpha;
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, w, h);
        // pieni vignette tuomaan laatua
        const rg = ctx.createRadialGradient(w * 0.5, h * 0.4, Math.min(w, h) * 0.1, w * 0.5, h * 0.6, Math.max(w, h) * 0.8);
        rg.addColorStop(0, "rgba(255,255,255,0.15)");
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = flashAlpha * 0.6;
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    const onResize = () => resize();
    resize();
    const respectReducedMotion = true; // voit muuttaa false, jos haluat ohittaa
    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
    } else {
      // Vähennetty liike: piirrä staattinen sade-kuosi
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = color;
      for (let i = 0; i < Math.min(160, Math.floor((w * h) / 25000)); i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = Math.random() * 14 + 6;
        ctx.fillRect(x, y, 1, len);
      }
      ctx.restore();
    }

    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, speed, wind, color, flashProbability, flashColor, flashMaxAlpha]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",   // ennen absolute
        inset: 0,
        zIndex: 0,
        background,
        pointerEvents: "none",
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
