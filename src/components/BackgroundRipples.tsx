"use client";
import React, { useEffect, useRef } from "react";

/**
 * Tumma “vesipinta + sadepisarat” -tausta.
 * - Kevyt heightmap-simulaatio (double buffer ripple)
 * - Säädettävä pisaratahti, vaimennus ja valon suunta
 * - Kunnioittaa prefers-reduced-motion (näyttää staattisen pinnan)
 */
type Props = {
  /** Pisaroiden määrä sekunnissa (0–500), oletus 120  */
  dropsPerSecond?: number;
  /** Pisaran “isku” (0.5–3), oletus 1.2 */
  dropStrength?: number;
  /** Vaimennus (0.9–0.999), suurempi = hitaammin häviävä, oletus 0.985 */
  damping?: number;
  /** Simulaation resoluutio-skaala (1=1:1, 0.5=puolet), oletus 0.5 */
  resolutionScale?: number;
  /** Veden väri/varjostus (pinnan ylsävyt) */
  tint?: string;
  /** Taustan gradientti tummalle vedelle */
  background?: string;
  /** Valon suunta: unit-vektori [x,y], oletus [0.6, -0.8] (yläoikealta) */
  lightDir?: [number, number];
  /** Respect reduced motion? (true = ei animaatiota kun asetettu) */
  respectReducedMotion?: boolean;
};

export default function BackgroundRipples({
  dropsPerSecond = 120,
  dropStrength = 1.2,
  damping = 0.985,
  resolutionScale = 0.5,
  tint = "#1a1a1a",
  background = "radial-gradient(1100px 700px at 12% 10%, #242424 0%, #141414 45%, #0c0c0c 100%)",
  lightDir = [0.6, -0.8],
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

    // simulaation “pieni” puskuri (upscale -> näyttö)
    const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    let W = 0, H = 0;   // näytön koko (CSS px)
    let gw = 0, gh = 0; // gridin koko (simun resoluutio)
    let curr!: Float32Array;
    let prev!: Float32Array;
    let img!: ImageData;
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d")!;

    // normaali­valaisu
    const lightLen = Math.hypot(lightDir[0], lightDir[1]) || 1;
    const lx = lightDir[0] / lightLen;
    const ly = lightDir[1] / lightLen;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));

      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      gw = Math.max(64, Math.floor(W * resolutionScale));
      gh = Math.max(64, Math.floor(H * resolutionScale));

      curr = new Float32Array(gw * gh);
      prev = new Float32Array(gw * gh);

      off.width = gw;
      off.height = gh;
      img = offCtx.createImageData(gw, gh);
    };

    const idx = (x: number, y: number) => y * gw + x;

    const disturb = (x: number, y: number, r = 2, s = dropStrength) => {
      // lisää “impulssi” pieneen säteeseen
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          const xx = x + i, yy = y + j;
          if (xx > 1 && xx < gw - 1 && yy > 1 && yy < gh - 1) {
            const d = Math.hypot(i, j);
            if (d <= r) {
              curr[idx(xx, yy)] += s * (1 - d / (r + 0.001));
            }
          }
        }
      }
    };

    // tiputa pisaroita tasaiseen tahtiin
    let dropAccumulator = 0;
    const emitDrops = (dt: number) => {
      dropAccumulator += dt * dropsPerSecond;
      while (dropAccumulator >= 1) {
        dropAccumulator -= 1;
        // älä pudota aivan reunoille (jotta aallot ehtii muodostua)
        const x = Math.floor(2 + Math.random() * (gw - 4));
        const y = Math.floor(2 + Math.random() * (gh - 4));
        disturb(x, y, 2, dropStrength);
      }
    };

    const step = () => {
      // wave-equation approx:
      // new = ((sum of 4-neighbors) / 2 - prev) * damping
      for (let y = 1; y < gh - 1; y++) {
        const row = y * gw;
        for (let x = 1; x < gw - 1; x++) {
          const i = row + x;
          const sum = (
            prev[i - 1] + prev[i + 1] +
            prev[i - gw] + prev[i + gw]
          ) / 2;
          let v = sum - curr[i];
          v *= damping;
          curr[i] = v;
        }
      }
      // swap
      const tmp = prev; prev = curr; curr = tmp;
    };

    const render = () => {
      const data = img.data;
      // valonlasku normaalista (keskieroista)
      for (let y = 1; y < gh - 1; y++) {
        const row = y * gw;
        for (let x = 1; x < gw - 1; x++) {
          const i = row + x;

          // korkeuserot → pinta-normaali
          const dx = (prev[i - 1] - prev[i + 1]);
          const dy = (prev[i - gw] - prev[i + gw]);

          // valon intensiteetti [-1..1] → [0..1]
          let shade = (dx * lx + dy * ly) * 1.6; // kerroin boostaa muotoa
          shade = Math.max(-1, Math.min(1, shade));
          const l = (shade + 1) * 0.5; // 0..1

          // tumma vesi + heijastus
          const base = 18; // tumma harmaa (≈ #121212)
          const R = base + Math.floor(120 * l);
          const G = base + Math.floor(120 * l);
          const B = base + Math.floor(120 * l);

          const p = i * 4;
          data[p] = R;
          data[p + 1] = G;
          data[p + 2] = B;
          data[p + 3] = 255;
        }
      }
      offCtx.putImageData(img, 0, 0);
      // skaalataan näytön koon mukaan (bilinear)
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, W, H);
      // kevyt sävy-päällinen
      ctx.fillStyle = tint;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!running) return;
      const now = performance.now();
      const dt = 1 / 60; // vakio dt: tasainen simulaatio
      emitDrops(dt);
      step();
      render();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => resize();

    resize();

    if (!(reduceMotion && respectReducedMotion)) {
      raf = requestAnimationFrame(loop);
    } else {
      // staattinen pinta: pieni epätasaisuus
      for (let i = 0; i < prev.length; i++) prev[i] = (Math.random() - 0.5) * 0.05;
      render();
    }

    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropsPerSecond, dropStrength, damping, resolutionScale, tint, background, lightDir[0], lightDir[1], respectReducedMotion]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background,
        pointerEvents: "none",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
