"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";

const GLASSES = [{ name: "Crown Glass", n: 1.52 }, { name: "Flint Glass", n: 1.62 }, { name: "Dense Flint", n: 1.75 }];
const SPECTRUM = [0x8b00ff, 0x4b0082, 0x0000ff, 0x00c853, 0xffeb3b, 0xff9800, 0xff0000];

export default function Prism() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ incidence: 50, n: 1.52 });
  const [incidence, setIncidence] = useState(50); const [glass, setGlass] = useState(GLASSES[0]);
  useEffect(() => { cfg.current = { incidence, n: glass.n }; }, [incidence, glass]);

  // Deviation estimate for A=60 prism: use prism formula numerically
  const A = 60 * Math.PI / 180; const i1 = incidence * Math.PI / 180;
  const r1 = Math.asin(Math.sin(i1) / glass.n); const r2 = A - r1;
  const sinI2 = glass.n * Math.sin(r2); const valid = sinI2 <= 1;
  const i2 = valid ? Math.asin(sinI2) : 0; const deviation = valid ? (i1 + i2 - A) * 180 / Math.PI : 0;

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { bg: 0x0b0620, camPos: [0, 4.2, 9.5], target: [0.8, 1.6, 0] });
    const { scene } = stage; scene.fog = null; floor(scene, 24, 0x120a2e);
    // Prism: triangular cross-section extruded
    const shape = new THREE.Shape(); shape.moveTo(-1.15, 0); shape.lineTo(1.15, 0); shape.lineTo(0, 1.95); shape.closePath();
    const prismGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    const prism = new THREE.Mesh(prismGeo, new THREE.MeshPhysicalMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.32, roughness: 0.03, metalness: 0, transmission: 0.55, thickness: 1.2, ior: 1.5 }));
    prism.position.set(0, 0.85, -0.55); prism.castShadow = true; scene.add(prism);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), new THREE.LineBasicMaterial({ color: 0xe9d5ff, transparent: true, opacity: 0.8 })); edges.position.copy(prism.position); scene.add(edges);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 0.22, 40), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })); table.position.y = 0.72; table.receiveShadow = true; scene.add(table);
    // Screen (right)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 3.1), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, side: THREE.DoubleSide })); screen.position.set(5.6, 1.9, 0.9); screen.rotation.y = -Math.PI / 2.6; scene.add(screen);
    const dyn = new THREE.Group(); scene.add(dyn);
    const beam = (pts: THREE.Vector3[], color: number, opacity = 0.95, w = 0.05) => {
      const curve = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, w, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity })); dyn.add(m);
    };
    stage.setAnimation(() => {
      dyn.clear();
      const { incidence: inc, n } = cfg.current; const i1r = inc * Math.PI / 180;
      const entry = new THREE.Vector3(-0.58, 1.95, 0); // on left face approx
      const src = new THREE.Vector3(entry.x - Math.cos(i1r - 0.5) * 4.2, entry.y + Math.sin(i1r - 0.5) * 4.2 * 0.55 + 0.6, 0);
      beam([src, entry], 0xffffff, 0.95, 0.045);
      const r1v = Math.asin(Math.sin(i1r) / n); const r2v = A - r1v; const s2 = n * Math.sin(r2v);
      if (s2 > 1) return; // total internal reflection - no emergent ray
      const i2v = Math.asin(s2);
      const exit = new THREE.Vector3(0.62, 1.8, 0);
      beam([entry, exit], 0xfde68a, 0.5, 0.035);
      // Dispersed fan: violet bends most
      SPECTRUM.forEach((c, idx) => {
        const spread = (idx - 3) * 0.028; const dev = (i1r + i2v - A) + spread * (n - 1) * 3.2;
        const dir = new THREE.Vector3(Math.cos(-dev + 0.15), Math.sin(-dev + 0.15), 0);
        const end = exit.clone().addScaledVector(dir, 5.2);
        beam([exit, end], c, 0.9, 0.028);
      });
      prism.rotation.y = Math.sin(performance.now() * 0.0002) * 0.04;
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        {!valid && <div className="absolute right-3 top-3 rounded-full bg-rose-500/85 px-4 py-2 font-bold backdrop-blur">Total Internal Reflection - no emergent ray</div>}
      </div>
      <div className="space-y-4">
        <Panel title="Prism Controls">
          <Slider label="Angle of Incidence" value={incidence} min={30} max={75} unit="°" onChange={setIncidence} />
          <div><p className="mb-1.5 text-sm font-medium text-slate-300">Prism Material</p><div className="grid grid-cols-3 gap-1.5">{GLASSES.map(g => <button key={g.name} onClick={() => setGlass(g)} className={`rounded-lg px-1 py-2 text-xs font-bold ${glass.name === g.name ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{g.name}<span className="block font-mono font-medium opacity-80">n = {g.n}</span></button>)}</div></div>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Deviation (δ)" value={valid ? `${deviation.toFixed(1)}°` : "TIR"} sub="δ = i₁ + i₂ - A" />
          <Stat label="Prism Angle (A)" value="60°" />
          <Stat label="Refractive Index" value={`${glass.n}`} sub={glass.name} />
          <Stat label="Most Deviated" value="Violet" sub="Red deviates least" />
        </div>
        <div className="rounded-3xl bg-violet-500/10 p-4 text-sm leading-relaxed text-violet-100/90 ring-1 ring-violet-400/20"><b>Find minimum deviation:</b> Sweep the incidence angle slowly between 40° and 55°. Deviation first falls, then rises - the lowest point is δₘ, the position used to measure refractive index accurately. Denser glass bends light more and spreads the spectrum wider.</div>
      </div>
    </div>
  );
}
