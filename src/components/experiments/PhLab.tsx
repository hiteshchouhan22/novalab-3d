"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite } from "@/lib/three-base";
import { Panel, Stat, ViewportHint } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

const SAMPLES = [
  { name: "Hydrochloric Acid", ph: 1, nature: "Strong Acid", plain: 0xf8fafc },
  { name: "Vinegar", ph: 3, nature: "Weak Acid", plain: 0xfef3c7 },
  { name: "Lemon Juice", ph: 2.5, nature: "Weak Acid", plain: 0xfde68a },
  { name: "Distilled Water", ph: 7, nature: "Neutral", plain: 0xe0f2fe },
  { name: "Soap Solution", ph: 9, nature: "Weak Base", plain: 0xe0e7ff },
  { name: "Baking Soda", ph: 8.5, nature: "Weak Base", plain: 0xf1f5f9 },
  { name: "Sodium Hydroxide", ph: 14, nature: "Strong Base", plain: 0xf8fafc },
];
export function phColor(ph: number): number {
  const stops: [number, number][] = [[0, 0xff0000], [2, 0xff6d00], [4, 0xffa000], [5, 0xffd600], [6, 0xc6ff00], [7, 0x00c853], [8, 0x00bfa5], [9, 0x0091ea], [11, 0x304ffe], [13, 0x6a1b9a], [14, 0x8e24aa]];
  for (let i = 0; i < stops.length - 1; i++) { const [p1, c1] = stops[i], [p2, c2] = stops[i + 1]; if (ph >= p1 && ph <= p2) { const a = new THREE.Color(c1), b = new THREE.Color(c2); return a.lerp(b, (ph - p1) / (p2 - p1)).getHex(); } }
  return 0x00c853;
}

export default function PhLab() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ sel: 0, indicator: false });
  const [sel, setSel] = useState(0); const [indicator, setIndicator] = useState(false); const [revealed, setRevealed] = useState(false);
  useEffect(() => { cfg.current = { sel, indicator }; }, [sel, indicator]);
  useEffect(() => { setRevealed(false); }, [sel]);
  const s = SAMPLES[sel];

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [0, 4.6, 8.6], target: [0, 1.2, 0] });
    const { scene } = stage; floor(scene, 22);
    const rack = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.22, 1.7), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })); rack.position.y = 0.75; rack.castShadow = rack.receiveShadow = true; scene.add(rack);
    const rack2 = rack.clone(); rack2.position.y = 1.85; rack2.scale.set(1, 0.7, 1); scene.add(rack2);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.22, roughness: 0.05, transmission: 0.5 });
    const liquids: THREE.Mesh[] = []; const rings: THREE.Mesh[] = [];
    SAMPLES.forEach((sm, i) => {
      const x = -3.6 + i * 1.2;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 2.1, 24, 1, true), glassMat); tube.position.set(x, 1.85, 0); scene.add(tube);
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat); bottom.rotation.x = Math.PI; bottom.position.set(x, 0.82, 0); scene.add(bottom);
      const liqMat = new THREE.MeshPhysicalMaterial({ color: sm.plain, transparent: true, opacity: 0.85, roughness: 0.1 });
      const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 1.25, 20), liqMat); liq.position.set(x, 1.45, 0); scene.add(liq); liquids.push(liq);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 32), new THREE.MeshBasicMaterial({ color: 0xfbbf24 })); ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.88, 0); ring.visible = false; scene.add(ring); rings.push(ring);
      const lab = labelSprite(sm.name.split(" ")[0], "#e2e8f0", 0.62); lab.position.set(x, 3.3, 0); scene.add(lab);
    });
    // Indicator bottle
    const bottle = new THREE.Group(); bottle.position.set(4.9, 0, 1.8); scene.add(bottle);
    const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.95, 20), new THREE.MeshPhysicalMaterial({ color: 0x92400e, transparent: true, opacity: 0.75, roughness: 0.2 })); bb.position.y = 0.5; bb.castShadow = true; bottle.add(bb);
    const dropper = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.5, 10), glassMat); dropper.position.y = 1.2; bottle.add(dropper);
    const bl = labelSprite("Universal Indicator", "#fcd34d", 0.75); bl.position.set(4.9, 1.85, 1.8); scene.add(bl);

    stage.setAnimation((t) => {
      liquids.forEach((liq, i) => {
        const targetPh = cfg.current.indicator ? SAMPLES[i].ph : null;
        const target = new THREE.Color(targetPh !== null ? phColor(targetPh) : SAMPLES[i].plain);
        (liq.material as THREE.MeshPhysicalMaterial).color.lerp(target, 0.05);
        const isSel = i === cfg.current.sel; liq.position.y = 1.45 + (isSel ? Math.sin(t * 2) * 0.03 + 0.06 : 0);
        rings[i].visible = isSel;
      });
    });
    return () => stage.dispose();
  }, []);

  const phHex = `#${phColor(s.ph).toString(16).padStart(6, "0")}`;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-black/55 p-3 backdrop-blur">
          <p className="mb-1.5 text-xs font-bold text-slate-300">pH Scale - Universal Indicator Colours</p>
          <div className="relative h-4 rounded-full" style={{ background: "linear-gradient(90deg,#ff0000,#ff6d00,#ffa000,#ffd600,#c6ff00,#00c853,#00bfa5,#0091ea,#304ffe,#6a1b9a,#8e24aa)" }}>
            {indicator && <div className="absolute -top-1 size-6 -translate-x-1/2 rounded-full border-[3px] border-white shadow-lg transition-all duration-500" style={{ left: `${(s.ph / 14) * 100}%`, background: phHex }} />}
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-300"><span>0 Acid</span><span>7 Neutral</span><span>14 Base</span></div>
        </div>
      </div>
      <div className="space-y-4">
        <Panel title="Test Samples">
          <div className="grid grid-cols-1 gap-1.5">{SAMPLES.map((sm, i) => <button key={sm.name} onClick={() => setSel(i)} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${sel === i ? "bg-teal-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{sm.name}<span className="float-right text-xs font-medium opacity-75">{indicator ? sm.nature : "?"}</span></button>)}</div>
          <button onClick={() => setIndicator(!indicator)} className={`w-full rounded-xl py-2.5 font-bold transition ${indicator ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-white/10"}`}>{indicator ? "Indicator Added - colours showing" : "Add Universal Indicator"}</button>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Sample" value={s.name.split(" ")[0]} sub={s.name} />
          <Stat label="Nature" value={indicator ? s.nature : "Test it!"} />
          <Stat label="Indicator Colour" value={indicator ? "Shown in tube" : "Not added"} sub={indicator ? "Match it to the scale" : ""} />
          <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">pH Meter</p>{revealed ? <p className="mt-0.5 font-mono text-lg font-black">pH {s.ph}</p> : <button onClick={() => setRevealed(true)} className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold hover:bg-white/15"><Eye className="size-3.5" /> Reveal reading</button>}</div>
        </div>
        <div className="rounded-3xl bg-teal-500/10 p-4 text-sm leading-relaxed text-teal-100/90 ring-1 ring-teal-400/20"><b>How to practise:</b> First guess the pH from the indicator colour and the scale, then reveal the meter reading to check yourself. Red-orange means acid, green is neutral, blue-purple is base.</div>
      </div>
    </div>
  );
}
