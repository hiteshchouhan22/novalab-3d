"use client";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

export function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-300">{label}</span><span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-bold">{value}{unit ?? ""}</span></span>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </label>
  );
}
export function PlayBar({ playing, onPlay, onReset }: { playing: boolean; onPlay: () => void; onReset: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onPlay} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 font-bold hover:opacity-90 transition">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}{playing ? "Pause" : "Play"}</button>
      <button onClick={onReset} className="grid size-11 place-items-center rounded-xl bg-white/10 hover:bg-white/15 transition" title="Reset"><RotateCcw className="size-4" /></button>
    </div>
  );
}
export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-0.5 font-mono text-lg font-black leading-none">{value}</p>{sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}</div>;
}
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-3 rounded-3xl bg-white/[0.03] p-4 ring-1 ring-white/10"><h3 className="text-sm font-black uppercase tracking-wider text-slate-300">{title}</h3>{children}</div>;
}
export function ViewportHint() {
  return <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">Drag to rotate • Scroll to zoom • Right-drag to pan</div>;
}
