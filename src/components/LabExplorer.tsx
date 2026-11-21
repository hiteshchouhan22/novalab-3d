"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { labs } from "@/lib/labs";
import { ArrowRight, Atom, Beaker, Clock, Dna, FlaskConical, FlaskRound, Flame, Focus, Gauge, MoveVertical, Orbit, Rocket, Search, TestTubes, Timer, Triangle, Zap, type LucideIcon } from "lucide-react";

const filters = ["All", "Physics", "Chemistry", "Biology"] as const;

const LAB_ICONS: Record<string, LucideIcon> = {
  pendulum: Timer, projectile: Rocket, "solar-system": Orbit, molecule: Atom, optics: Focus, dna: Dna,
  "ohms-law": Zap, "hookes-law": MoveVertical, prism: Triangle, titration: FlaskConical, "ph-lab": TestTubes,
  "flame-test": Flame, "salt-analysis": Beaker, "organic-tests": FlaskRound,
};

export default function LabExplorer() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = useMemo(() => labs.filter(l => (f === "All" || l.subject === f) && (l.title + l.description + l.concepts.join(" ")).toLowerCase().includes(q.toLowerCase())), [q, f]);
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(x => (
            <button key={x} onClick={() => setF(x)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${f === x ? "bg-white text-slate-900" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{x}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 ring-1 ring-white/10 focus-within:ring-indigo-400">
          <Search className="size-4 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search experiments..." className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-500" />
        </label>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((lab, i) => (
          <Link key={lab.id} href={`/lab/${lab.id}`} className="group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/25 animate-fadeUp" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="relative h-40 p-5" style={{ backgroundColor: `${lab.accent}14` }}>
              <span className="absolute right-4 top-4 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-bold backdrop-blur">{lab.classLevel}</span>
              {(() => { const Icon = LAB_ICONS[lab.id] ?? FlaskConical; return <span className="grid size-16 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10"><Icon className="size-8" style={{ color: lab.accent }} /></span>; })()}
              <div className="absolute bottom-4 left-5 right-5 flex gap-1.5">{lab.concepts.map(c => <span key={c} className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur">{c}</span>)}</div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold"><span style={{ color: lab.accent }}>{lab.subject}</span><span className="flex items-center gap-3 font-medium text-slate-400"><span className="flex items-center gap-1"><Clock className="size-3.5" />{lab.duration}</span><span className="flex items-center gap-1"><Gauge className="size-3.5" />{lab.difficulty}</span></span></div>
              <h3 className="mt-2 text-xl font-bold group-hover:text-cyan-300 transition">{lab.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{lab.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">Start Experiment <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-slate-400">No experiments match your search. Try another keyword.</p>}
    </div>
  );
}
