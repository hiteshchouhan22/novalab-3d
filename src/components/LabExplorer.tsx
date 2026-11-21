"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { labs } from "@/lib/labs";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

const filters = ["All", "Physics", "Chemistry", "Biology"] as const;

export default function LabExplorer() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = useMemo(() => labs.filter(l => (f === "All" || l.subject === f) && (l.title + l.description + l.concepts.join(" ")).toLowerCase().includes(q.toLowerCase())), [q, f]);
  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-[#1c1a15] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(x => (
            <button key={x} onClick={() => setF(x)} className={`border px-4 py-2 text-sm font-semibold transition ${f === x ? "border-[#1c1a15] bg-[#1c1a15] text-[#f5f1e8]" : "border-[#1c1a15]/30 text-[#57534a] hover:border-[#1c1a15] hover:text-[#1c1a15]"}`}>{x}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 border border-[#1c1a15]/30 px-3.5 py-2.5 transition focus-within:border-[#2e40e0]">
          <Search className="size-4 text-[#57534a]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the index..." className="w-52 bg-transparent text-sm outline-none placeholder:text-[#57534a]/70" />
        </label>
      </div>
      <div>
        {list.map((lab) => {
          const n = labs.findIndex(l => l.id === lab.id) + 1;
          return (
            <Link key={lab.id} href={`/lab/${lab.id}`} className="group grid grid-cols-[44px_1fr_auto] items-baseline gap-x-4 border-b border-[#d9d2c0] py-5 transition hover:bg-[#efe9dc] sm:grid-cols-[56px_1fr_auto_auto] sm:px-3">
              <span className="font-mono text-sm font-semibold" style={{ color: lab.accent === "#fbbf24" ? "#b45309" : lab.accent }}>{String(n).padStart(2, "0")}</span>
              <span>
                <span className="font-display block text-xl font-bold leading-snug group-hover:text-[#2e40e0] sm:text-2xl">{lab.title}</span>
                <span className="mt-1 line-clamp-1 block max-w-2xl text-sm text-[#57534a]">{lab.description}</span>
                <span className="mt-2 flex flex-wrap gap-1.5 sm:hidden">{lab.concepts.map(c => <span key={c} className="border border-[#1c1a15]/20 px-2 py-0.5 text-[11px] font-medium text-[#57534a]">{c}</span>)}</span>
              </span>
              <span className="hidden text-right font-mono text-xs leading-relaxed text-[#57534a] sm:block">{lab.subject}<br />{lab.classLevel} · {lab.duration}<br />{lab.difficulty}</span>
              <ArrowUpRight className="size-5 self-center text-[#57534a] transition group-hover:translate-x-0.5 group-hover:text-[#2e40e0]" />
            </Link>
          );
        })}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-[#57534a]">Nothing in the index matches that search. Try another keyword.</p>}
      <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-[#57534a]">End of index <ArrowRight className="size-3.5" /> {list.length} of {labs.length} experiments shown</p>
    </div>
  );
}
