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
      <Link href="/#labs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#57534a] hover:text-[#1c1a15]"><ArrowLeft className="size-4" /> Back to the index</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#1c1a15] pb-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-[#57534a]">
            <span className="border border-[#1c1a15] px-2.5 py-1 font-semibold text-[#1c1a15]">{lab.subject}</span>
            <span>{lab.classLevel}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" /> {lab.duration}</span>
            <span>{lab.difficulty}</span>
            <span>No. {String(idx + 1).padStart(2, "0")} of {labs.length}</span>
          </div>
          <h1 className="font-display mt-3 text-4xl font-black tracking-tight sm:text-5xl">{lab.title}</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-[#57534a]">{lab.description}</p>
        </div>
        <Link href={`/lab/${next.id}`} className="group border border-[#1c1a15]/25 px-4 py-3 transition hover:border-[#1c1a15] hover:bg-[#efe9dc]">
          <span className="block font-mono text-xs text-[#57534a]">Next in the index</span>
          <span className="mt-0.5 flex items-center gap-2 font-display text-lg font-bold">{next.title} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        </Link>
      </div>

      <div className="mt-6 bg-[#10131c] p-2 text-slate-100 shadow-[0_18px_50px_rgba(28,26,21,0.25)] sm:p-3">
        <LabClient id={lab.id} />
      </div>

      <div className="mt-8 grid gap-px border border-[#1c1a15] bg-[#1c1a15] md:grid-cols-3">
        <section className="bg-[#f5f1e8] p-5"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><Target className="size-5 text-[#2e40e0]" /> Aim</h2><p className="mt-2 text-sm leading-relaxed text-[#57534a]">{lab.aim}</p></section>
        <section className="bg-[#f5f1e8] p-5"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><BookOpen className="size-5 text-[#2e40e0]" /> Theory</h2><ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#57534a]">{lab.theory.map(t => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2e40e0]" />{t}</li>)}</ul></section>
        <section className="bg-[#f5f1e8] p-5"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><ClipboardList className="size-5 text-[#2e40e0]" /> Procedure</h2><ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#57534a]">{lab.procedure.map(p => <li key={p}>{p}</li>)}</ol></section>
      </div>
    </div>
  );
}
