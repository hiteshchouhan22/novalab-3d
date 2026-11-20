"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor } from "@/lib/three-base";
import { buildTubeBench } from "@/components/tube-bench";
import { Panel, Stat, ViewportHint } from "@/components/ui";
import { FlaskConical } from "lucide-react";

const CASES = [
  { tube: 0, salt: "Sodium Chloride + AgNO₃", eq: "NaCl + AgNO₃ → AgCl↓ + NaNO₃", obs: "White curdy precipitate of AgCl forms", inf: "Cl⁻ ion confirmed", liquid: 0xf1f5f9, ppt: 0xffffff, pptAmt: 1, bubbles: false },
  { tube: 1, salt: "Copper Sulphate + NaOH", eq: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄", obs: "Pale blue gelatinous precipitate of Cu(OH)₂", inf: "Cu²⁺ ion confirmed", liquid: 0x7dd3fc, ppt: 0x38bdf8, pptAmt: 1, bubbles: false },
  { tube: 2, salt: "Iron(III) Chloride + NaOH", eq: "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl", obs: "Reddish-brown precipitate of Fe(OH)₃", inf: "Fe³⁺ ion confirmed", liquid: 0xfde68a, ppt: 0x92400e, pptAmt: 1, bubbles: false },
  { tube: 1, salt: "Sodium Carbonate + dil. HCl", eq: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑", obs: "Brisk effervescence - CO₂ turns lime water milky", inf: "CO₃²⁻ ion confirmed", liquid: 0xe0f2fe, ppt: 0xffffff, pptAmt: 0, bubbles: true },
];

export default function SaltAnalysis() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ active: -1, progress: 0 });
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState<boolean[]>([false, false, false, false]);
  useEffect(() => { cfg.current.active = active; cfg.current.progress = 0; }, [active]);
  const c = active >= 0 ? CASES[active] : null;

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [0, 3.6, 8.2], target: [0, 1.3, 0] });
    const { scene } = stage; floor(scene, 22);
    const bench = buildTubeBench(scene, ["Tube 1", "Tube 2", "Tube 3"]);
    stage.setAnimation((t, dt) => {
      const a = cfg.current.active;
      if (a >= 0) {
        cfg.current.progress = Math.min(1, cfg.current.progress + dt * 0.7);
        const cs = CASES[a]; const p = cfg.current.progress;
        bench.liquidMats[cs.tube].color.lerp(new THREE.Color(cs.liquid), 0.05);
        bench.ppts[cs.tube].scale.y = Math.max(0.001, cs.pptAmt * p);
        if (cs.bubbles) {
          bench.bubbles.visible = p > 0.15;
          bench.bubbles.position.set(bench.liquids[cs.tube].position.x, 0.8, 0);
          bench.bubbleMeshes.forEach((b, i) => { b.position.y = (b.position.y + dt * (0.5 + (i % 5) * 0.14)) % 1.05; });
        } else bench.bubbles.visible = false;
      }
    });
    return () => stage.dispose();
  }, []);

  const run = (i: number) => { setActive(i); setTimeout(() => setDone(d => d.map((v, j) => j === i ? true : v)), 1500); };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-4 py-2 font-bold backdrop-blur">Cases completed: {done.filter(Boolean).length} / 4</div>
      </div>
      <div className="space-y-4">
        <Panel title="Reaction Cases - add the reagent">
          <div className="grid grid-cols-1 gap-1.5">{CASES.map((cs, i) => <button key={cs.salt} onClick={() => run(i)} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${active === i ? "bg-sky-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{cs.salt}<span className="float-right">{done[i] ? "✓" : ""}</span></button>)}</div>
        </Panel>
        {c ? (
          <div className="space-y-3">
            <Stat label="Equation" value={c.eq} />
            <div className="rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/10"><p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><FlaskConical className="size-3.5" /> Observation</p><p className="mt-1 text-sm leading-relaxed">{c.obs}</p></div>
            <Stat label="Inference" value={c.inf} />
          </div>
        ) : (
          <div className="rounded-3xl bg-sky-500/10 p-4 text-sm leading-relaxed text-sky-100/90 ring-1 ring-sky-400/20"><b>Salt analysis:</b> Pick a case to add the reagent to the test tube. Watch for a precipitate (a solid forming in the liquid) or effervescence (gas bubbles) - each result identifies one ion.</div>
        )}
      </div>
    </div>
  );
}
