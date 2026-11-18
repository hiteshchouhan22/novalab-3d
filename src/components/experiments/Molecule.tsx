"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite } from "@/lib/three-base";
import { Panel, Stat, ViewportHint } from "@/components/ui";

type Atom = { el: string; pos: [number, number, number] };
const MOLECULES: Record<string, { name: string; formula: string; shape: string; angle: string; atoms: Atom[]; bonds: [number, number][]; desc: string }> = {
  water: { name: "Water", formula: "H₂O", shape: "Bent", angle: "104.5°", desc: "Two lone pairs on oxygen push the H atoms together - that bent shape makes water polar.", atoms: [{ el: "O", pos: [0, 0.3, 0] }, { el: "H", pos: [-0.95, -0.55, 0] }, { el: "H", pos: [0.95, -0.55, 0] }], bonds: [[0, 1], [0, 2]] },
  co2: { name: "Carbon Dioxide", formula: "CO₂", shape: "Linear", angle: "180°", desc: "Double bonds on both sides keep CO₂ perfectly straight - and non-polar overall.", atoms: [{ el: "C", pos: [0, 0, 0] }, { el: "O", pos: [-1.5, 0, 0] }, { el: "O", pos: [1.5, 0, 0] }], bonds: [[0, 1], [0, 2]] },
  methane: { name: "Methane", formula: "CH₄", shape: "Tetrahedral", angle: "109.5°", desc: "Four H atoms sit at the corners of a tetrahedron - the most spacious arrangement possible.", atoms: [{ el: "C", pos: [0, 0, 0] }, { el: "H", pos: [1, 1, 1] }, { el: "H", pos: [-1, -1, 1] }, { el: "H", pos: [-1, 1, -1] }, { el: "H", pos: [1, -1, -1] }], bonds: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  ammonia: { name: "Ammonia", formula: "NH₃", shape: "Trigonal Pyramidal", angle: "107°", desc: "One lone pair on nitrogen pushes the three H atoms down into a pyramid.", atoms: [{ el: "N", pos: [0, 0.45, 0] }, { el: "H", pos: [-1.05, -0.45, 0.35] }, { el: "H", pos: [1.05, -0.45, 0.35] }, { el: "H", pos: [0, -0.45, -1.1] }], bonds: [[0, 1], [0, 2], [0, 3]] },
};
const COLORS: Record<string, { c: number; r: number }> = { H: { c: 0xf8fafc, r: 0.34 }, O: { c: 0xef4444, r: 0.62 }, C: { c: 0x374151, r: 0.58 }, N: { c: 0x3b82f6, r: 0.58 } };

export default function Molecule() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ key: "water", labels: true, spin: true });
  const [key, setKey] = useState("water"); const [labels, setLabels] = useState(true); const [spin, setSpin] = useState(true);
  useEffect(() => { cfg.current = { key, labels, spin }; }, [key, labels, spin]);
  const mol = MOLECULES[key];

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [3.2, 2.2, 4.5], target: [0, 0.6, 0] });
    const { scene } = stage; floor(scene, 18);
    let group: THREE.Group | null = null; let builtKey = "";
    const build = (k: string) => {
      if (group) { scene.remove(group); }
      group = new THREE.Group(); group.position.y = 1.5; const m = MOLECULES[k];
      m.atoms.forEach(a => {
        const info = COLORS[a.el];
        const s = new THREE.Mesh(new THREE.SphereGeometry(info.r, 44, 30), new THREE.MeshPhysicalMaterial({ color: info.c, roughness: 0.22, metalness: 0.05, clearcoat: 0.7 }));
        s.position.set(...a.pos); s.castShadow = true; group!.add(s);
        const lab = labelSprite(a.el, "#fff", 0.8); lab.name = "label"; lab.position.set(a.pos[0], a.pos[1] + info.r + 0.35, a.pos[2]); group!.add(lab);
      });
      m.bonds.forEach(([i, j]) => {
        const a = new THREE.Vector3(...m.atoms[i].pos), b = new THREE.Vector3(...m.atoms[j].pos);
        const len = a.distanceTo(b); const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, len, 18), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.4 }));
        bond.position.copy(a).lerp(b, 0.5); bond.lookAt(b); bond.rotateX(Math.PI / 2); bond.castShadow = true; group!.add(bond);
      });
      scene.add(group); builtKey = k;
    };
    build("water");
    stage.setAnimation((t, dt) => {
      if (builtKey !== cfg.current.key) build(cfg.current.key);
      if (group) { if (cfg.current.spin) group.rotation.y += dt * 0.55; group.position.y = 1.5 + Math.sin(t * 1.1) * 0.07; group.traverse(o => { if (o.name === "label") o.visible = cfg.current.labels; }); }
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint /><div className="absolute bottom-3 left-3 flex gap-2 text-xs font-medium">{Object.entries(COLORS).map(([el, v]) => <span key={el} className="flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur"><span className="size-2.5 rounded-full" style={{ background: `#${v.c.toString(16).padStart(6, "0")}` }} />{el}</span>)}</div></div>
      <div className="space-y-4">
        <Panel title="Choose Molecule"><div className="grid grid-cols-2 gap-2">{Object.entries(MOLECULES).map(([k, m]) => <button key={k} onClick={() => setKey(k)} className={`rounded-xl py-2.5 font-bold ${key === k ? "bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{m.formula}<span className="block text-xs font-medium opacity-80">{m.name}</span></button>)}</div>
          <div className="flex gap-2 pt-1"><button onClick={() => setLabels(!labels)} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${labels ? "bg-white text-slate-900" : "bg-white/5"}`}>Labels {labels ? "ON" : "OFF"}</button><button onClick={() => setSpin(!spin)} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${spin ? "bg-white text-slate-900" : "bg-white/5"}`}>Spin {spin ? "ON" : "OFF"}</button></div>
        </Panel>
        <div className="grid grid-cols-2 gap-3"><Stat label="Shape" value={mol.shape} /><Stat label="Bond Angle" value={mol.angle} /></div>
        <div className="rounded-3xl bg-emerald-500/10 p-4 text-sm leading-relaxed text-emerald-100/90 ring-1 ring-emerald-400/20"><b>{mol.formula} - {mol.shape}:</b> {mol.desc}</div>
      </div>
    </div>
  );
}
