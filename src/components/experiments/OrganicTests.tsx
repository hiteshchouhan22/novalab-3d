"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor } from "@/lib/three-base";
import { buildTubeBench } from "@/components/tube-bench";
import { Panel, Stat, ViewportHint } from "@/components/ui";
import { FlaskConical } from "lucide-react";

const CASES = [
  { tube: 0, test: "Carbonyl + 2,4-DNP", group: "Aldehyde / Ketone (C=O)", obs: "Orange-yellow precipitate of 2,4-dinitrophenylhydrazone forms", liquid: 0xfff7ed, ppt: 0xfb923c, pptAmt: 1, bubbles: false },
  { tube: 1, test: "Carboxylic Acid + NaHCO₃", group: "Carboxylic Acid (-COOH)", obs: "Brisk effervescence - CO₂ gas evolves and turns lime water milky", liquid: 0xe0f2fe, ppt: 0xffffff, pptAmt: 0, bubbles: true },
  { tube: 2, test: "Phenol + Neutral FeCl₃", group: "Phenol", obs: "Solution turns violet - phenol forms a violet complex with Fe³⁺", liquid: 0x7c3aed, ppt: 0xffffff, pptAmt: 0, bubbles: false },
];

export default function OrganicTests() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ active: -1, progress: 0 });
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  useEffect(() => { cfg.current.active = active; cfg.current.progress = 0; }, [active]);
  const c = active >= 0 ? CASES[active] : null;

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [0, 3.6, 8.2], target: [0, 1.3, 0] });
    const { scene } = stage; floor(scene, 22);
    const bench = buildTubeBench(scene, ["Carbonyl", "Acid", "Phenol"]);
    stage.setAnimation((t, dt) => {
      const a = cfg.current.active;
      if (a >= 0) {
        cfg.current.progress = Math.min(1, cfg.current.progress + dt * 0.7);
        const cs = CASES[a]; const p = cfg.current.progress;
        bench.liquidMats[cs.tube].color.lerp(new THREE.Color(cs.liquid), 0.05);
        bench.liquidMats[cs.tube].opacity = 0.55 + p * 0.3;
        bench.ppts[cs.tube].scale.y = Math.max(0.001, cs.pptAmt * p);
        (bench.ppts[cs.tube].material as THREE.MeshStandardMaterial).color.setHex(cs.ppt);
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
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-4 py-2 font-bold backdrop-blur">Groups identified: {done.filter(Boolean).length} / 3</div>
      </div>
      <div className="space-y-4">
        <Panel title="Spot Tests - add the reagent">
          <div className="grid grid-cols-1 gap-1.5">{CASES.map((cs, i) => <button key={cs.test} onClick={() => run(i)} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${active === i ? "bg-orange-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{cs.test}<span className="float-right">{done[i] ? "✓" : ""}</span></button>)}</div>
        </Panel>
        {c ? (
          <div className="space-y-3">
            <Stat label="Functional Group" value={c.group} />
            <div className="rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/10"><p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><FlaskConical className="size-3.5" /> Observation</p><p className="mt-1 text-sm leading-relaxed">{c.obs}</p></div>
          </div>
        ) : (
          <div className="rounded-3xl bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-100/90 ring-1 ring-orange-400/20"><b>How organic tests work:</b> Each functional group reacts with one specific reagent in a visible way - a coloured precipitate, gas evolution, or a colour change. Run all three tests and match each observation to its group.</div>
        )}
      </div>
    </div>
  );
}
