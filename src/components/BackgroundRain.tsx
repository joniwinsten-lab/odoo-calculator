"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  density?: number;           // 0.3–1.5
  speed?: number;             // 0.6–1.6
  wind?: number;              // -0.3…0.3
  color?: string;             // pääväri pisaroille (RGBA)
  coreColor?: string;         // “ydinviivan” väri (terävämpi)
  background?: string;        // canvas-wrapperin tausta
  blurPx?: number;            // koko taustan blur (0 = pois)
  flashProbability?: number;  // 0–1 / s
  flashColor?: string;
  flashMaxAlpha?: number;
  respectReducedMotion?: boolean; // jos true, obey OS:n asetus
};

export default function BackgroundRain({
  density = 0.9,
  speed = 1.1,
  wind = 0.08,
  color = "rgba(255,255,255,0.22)",       // hiukan vahvempi
  coreColor = "rgba(255,255,255,0.75)",   // kirkas ydin
  background = "radial-gradient(1100px 700px at 12% 10%, #242424 0%, #151515 45%, #0d0d0d 100%)",
  blurPx = 0,                             // aloita ilman sumua → näkyy varmasti
  flashProbability = 0.02,
  flashColor = "rgba(255,255,255,0.9)",
  flashMaxAlpha = 0.25,
  respectReducedMotion = true,
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
    let flashAlpha = 0;

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const makeDrop = (): Drop => {
      const baseVy = rand(520, 980) * speed; // px/s
      return {
        x: rand(0, w),
        y: rand(-h, h),
        vy: baseVy,
        vx: wind * rand(30, 70) * speed,
        len: rand(12, 26) * (baseVy / 700),
        thick: rand(1.2, 2.2),     // paksumpi
        alpha: rand(0.5, 0.9),     // vahvempi per-pisara alpha
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
      const targetCount = Math.floor((area / 9000) * density); // hieman tiheämpi kaava
      drops = Array.from({ length: targetCount }, () => makeDrop());
    };

    const splash = (x: number, y: number, r: number, a: number) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(0.25, a));
      ctx.strokeStyle = color;
      ctx.lineWidth = r * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI, true);
      ctx.stroke();
      ctx.restore();
    };

    let last = performance.now();
    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      // salama
      if (Math.random() < flashProbability * dt) {
        flashAlpha = Math.min(flashMaxAlpha, flashAlpha + rand(0.12, flashMaxAlpha));
      }
      flashAlpha *= Math.pow(0.35, dt);

      // tyhjennys
      ctx.clearRect(0, 0, w, h);

      // *** DRAW RAIN with additive blend & glow ***
      ctx.save();
      ctx.globalCompositeOperation = "screen"; // valaisee tummaa
      ctx.lineCap = "round";

      // ulompi “glow”-viiva
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.vy * dt;
        d.x += d.vx * dt;

        if (d.y - d.len > h) {
          if (Math.random() < 0.08) splash(d.x, h - 2, d.thick * 1.2, d.alpha * 0.8);
          drops[i] = makeDrop();
          drops[i].y = rand(-h * 0.5, -20);
        }
        if (d.x < -50) d.x = w + 50;
        if (d.x > w + 50) d.x = -50;

        ctx.globalAlpha = d.alpha * 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = d.thick + 0.8; // glow hieman paksumpi
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 0.02, d.y - d.len);
        ctx.stroke();
      }

      // ydinviiva (terävä)
      ctx.shadowBlur = 0;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.globalAlpha = Math.min(1, d.alpha * 0.9);
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = Math.max(1, d.thick * 0.6);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 0.02, d.y - d.len);
        ctx.stroke();
      }
      ctx.restore();

      // salama-peite
      if (flashAlpha > 0.001) {
        ctx.save();
        ctx.globalAlpha = flashAlpha;
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, w, h);
        const rg = ctx.createRadialGradient(
          w * 0.5, h * 0.4, Math.min(w, h) * 0.1,
          w * 0.5, h * 0.6, Math.max(w, h) * 0.8
        );
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

    if (!(reduceMotion && respectReducedMotion)) {
      raf = requestAnimationFrame(tick);
    } else {
      // staattinen sade-kuosi
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = coreColor;
      for (let i = 0; i < Math.min(220, Math.floor((w * h) / 20000)); i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = Math.random() * 16 + 8;
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
  }, [density, speed, wind, color, coreColor, flashProbability, flashColor, flashMaxAlpha, respectReducedMotion]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed", // peittää aina näkymän
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
