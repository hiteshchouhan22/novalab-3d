import Link from "next/link";
import LabExplorer from "@/components/LabExplorer";
import { Sparkles, Zap, MousePointerClick, Gauge, ShieldCheck, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="relative overflow-hidden py-14 sm:py-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10"><div className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" /><div className="absolute right-10 top-24 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" /></div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/10"><Sparkles className="size-3.5 text-cyan-300" /> VIRTUAL LAB, REIMAGINED IN REAL 3D</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Practice experiments like you are <span className="text-gradient">actually in the lab</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">No flat diagrams. No slow, blurry simulations. NovaLab 3D gives you high-quality interactive 3D models, live calculations, instant feedback and controls that feel like real apparatus.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/lab/pendulum" className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3.5 font-bold shadow-xl shadow-indigo-500/25 hover:opacity-90 transition">Start First Experiment</Link>
          <Link href="#labs" className="rounded-full bg-white/5 px-6 py-3.5 font-bold ring-1 ring-white/15 hover:bg-white/10 transition">Browse All Labs</Link>
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
          {[["6", "3D Experiments"], ["< 1s", "Lab Load Time"], ["100%", "Free to Practice"]].map(([v, l]) => (<div key={l} className="py-4"><p className="text-xl font-black sm:text-2xl">{v}</p><p className="text-xs text-slate-400 sm:text-sm">{l}</p></div>))}
        </div>
      </section>
      <section id="labs" className="scroll-mt-24 pb-16">
        <div className="mb-6"><h2 className="text-2xl font-black sm:text-3xl">Choose your experiment</h2><p className="mt-1 text-slate-400">Physics, Chemistry and Biology - each with theory, procedure and live results.</p></div>
        <LabExplorer />
      </section>
      <section id="why" className="scroll-mt-24 pb-20">
        <h2 className="text-2xl font-black sm:text-3xl">Why students prefer NovaLab over old virtual labs</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Zap, "Super fast loading", "3D loads only for the lab you open, code-split per experiment. Homepage has zero 3D weight."],
            [MousePointerClick, "Truly interactive", "Drag, rotate, change values and see physics update instantly - not just play a video."],
            [Gauge, "Live calculations", "Period, range, focal length and more computed in real time and matched with theory."],
            [Smartphone, "Works anywhere", "Responsive design, capped pixel ratio and lightweight geometry - smooth even on phones."],
          ].map(([Icon, t, d]: any) => (
            <div key={t} className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10"><Icon className="size-6 text-cyan-300" /><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-400">{d}</p></div>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-3xl bg-emerald-500/10 p-5 ring-1 ring-emerald-400/20"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" /><p className="text-sm leading-relaxed text-emerald-100/90"><b>Quality promise:</b> Every model here is built procedurally with PBR materials, soft shadows, ACES tone mapping and proper lighting - no low-poly placeholders, no borrowed blurry assets.</p></div>
      </section>
    </div>
  );
}
