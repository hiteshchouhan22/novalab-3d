import { notFound } from "next/navigation";
import Link from "next/link";
import { getLab, labs } from "@/lib/labs";
import LabClient from "./LabClient";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, Clock, Target } from "lucide-react";

export function generateStaticParams() { return labs.map(l => ({ id: l.id })); }

export default async function LabPage({ params }: PageProps<"/lab/[id]">) {
  const { id } = await params;
  const lab = getLab(id);
  if (!lab) notFound();
  const idx = labs.findIndex(l => l.id === id);
  const next = labs[(idx + 1) % labs.length];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/#labs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft className="size-4" /> All Experiments</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><span className={`rounded-full bg-gradient-to-r ${lab.gradient} px-3 py-1 text-white`}>{lab.subject}</span><span className="text-slate-400">{lab.classLevel} • <Clock className="inline size-3.5" /> {lab.duration} • {lab.difficulty}</span></div>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{lab.emoji} {lab.title}</h1>
          <p className="mt-2 leading-relaxed text-slate-400">{lab.description}</p>
        </div>
        <Link href={`/lab/${next.id}`} className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 hover:bg-white/[0.07]"><span className="text-right"><span className="block text-xs text-slate-400">Next experiment</span><span className="font-bold">{next.title}</span></span><ArrowRight className="size-5 transition group-hover:translate-x-1" /></Link>
      </div>

      <div className="mt-6"><LabClient id={lab.id} /></div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10"><h2 className="flex items-center gap-2 font-black"><Target className="size-5 text-cyan-300" /> Aim</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">{lab.aim}</p></section>
        <section className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10"><h2 className="flex items-center gap-2 font-black"><BookOpen className="size-5 text-indigo-300" /> Theory</h2><ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-300">{lab.theory.map(t => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />{t}</li>)}</ul></section>
        <section className="rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10"><h2 className="flex items-center gap-2 font-black"><ClipboardList className="size-5 text-amber-300" /> Procedure</h2><ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">{lab.procedure.map(p => <li key={p}>{p}</li>)}</ol></section>
      </div>
    </div>
  );
}
