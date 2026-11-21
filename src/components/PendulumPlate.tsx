"use client";
import { useEffect, useRef } from "react";

/** Plate I - a real, working simple pendulum drawn on canvas.
 *  Physics: theta'' = -(g/L) sin(theta), integrated live. */
export default function PendulumPlate() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cv = canvas.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    const L = 1.0, g = 9.8;
    let theta = 0.65, omega = 0, last = performance.now(), swings = 0, prevSign = 1, period = 0, lastCross = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      // semi-implicit integration, substeps for stability
      const steps = 4, h = dt / steps;
      for (let i = 0; i < steps; i++) { omega += -(g / L) * Math.sin(theta) * h; theta += omega * h; }
      const sign = Math.sign(theta);
      if (sign !== prevSign && sign !== 0) { swings++; const t = (now - lastCross) / 1000; if (t > 0.5) period = t * 2; lastCross = now; prevSign = sign; }
      const px = W / 2, py = 46, len = H - 130;
      const bx = px + Math.sin(theta) * len, by = py + Math.cos(theta) * len;
      ctx.clearRect(0, 0, W, H);
      // stand
      ctx.strokeStyle = "#1c1a15"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px - 90, py); ctx.lineTo(px + 90, py); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 90, py); ctx.lineTo(px - 90, H - 28); ctx.moveTo(px + 90, py); ctx.lineTo(px + 90, H - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 110, H - 28); ctx.lineTo(px + 110, H - 28); ctx.stroke();
      // string + bob
      ctx.strokeStyle = "#57534a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
      const grad = ctx.createRadialGradient(bx - 5, by - 6, 3, bx, by, 19);
      grad.addColorStop(0, "#5b6cff"); grad.addColorStop(1, "#2e40e0");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(bx, by, 17, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#1c1a15"; ctx.lineWidth = 1.5; ctx.stroke();
      // trace arc
      ctx.strokeStyle = "rgba(28,26,21,.18)"; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.arc(px, py, len, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7); ctx.stroke(); ctx.setLineDash([]);
      if (readout.current && swings > 0) readout.current.textContent = `T = ${period ? period.toFixed(2) : (2 * Math.PI * Math.sqrt(L / g)).toFixed(2)} s · swing ${swings}`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure className="border border-[#1c1a15] bg-[#efe9dc]">
      <div className="flex items-center justify-between border-b border-[#1c1a15] px-4 py-2.5">
        <span className="font-mono text-xs font-semibold">Plate I</span>
        <span ref={readout} className="font-mono text-xs text-[#57534a]">T = 2.01 s · warming up</span>
      </div>
      <canvas ref={canvas} width={520} height={430} className="block h-auto w-full" />
      <figcaption className="border-t border-[#1c1a15] px-4 py-2.5 text-sm text-[#57534a]">Simple pendulum, drawn live. The same physics runs the full 3D experiment, with length and gravity in your hands.</figcaption>
    </figure>
  );
}
