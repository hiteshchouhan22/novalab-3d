"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, labelSprite } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";

const BASES = [
  { a: "A", b: "T", ca: 0x34d399, cb: 0xfbbf24, bonds: 2 },
  { a: "G", b: "C", ca: 0x60a5fa, cb: 0xf472b6, bonds: 3 },
  { a: "T", b: "A", ca: 0xfbbf24, cb: 0x34d399, bonds: 2 },
  { a: "C", b: "G", ca: 0xf472b6, cb: 0x60a5fa, bonds: 3 },
];

export default function Dna() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ unwind: 0, speed: 1, labels: true });
  const [unwind, setUnwind] = useState(0); const [speed, setSpeed] = useState(1); const [labels, setLabels] = useState(true);
  useEffect(() => { cfg.current = { unwind, speed, labels }; }, [unwind, speed, labels]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { bg: 0x0b0614, camPos: [5, 3.5, 7], target: [0, 2.6, 0] });
    const { scene } = stage; scene.fog = null;
    const helix = new THREE.Group(); scene.add(helix);
    const pairs = 18; const spheres: { mesh: THREE.Mesh; side: number; idx: number }[] = []; const rungs: THREE.Mesh[] = []; const labs: THREE.Sprite[] = [];
    const backboneMat1 = new THREE.MeshPhysicalMaterial({ color: 0xa78bfa, roughness: 0.25, clearcoat: 0.7 });
    const backboneMat2 = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, roughness: 0.25, clearcoat: 0.7 });
    for (let i = 0; i < pairs; i++) {
      const bp = BASES[i % 4];
      for (const side of [0, 1]) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.21, 28, 20), side ? backboneMat2 : backboneMat1);
        s.castShadow = true; helix.add(s); spheres.push({ mesh: s, side, idx: i });
        const base = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 18), new THREE.MeshPhysicalMaterial({ color: side ? bp.cb : bp.ca, roughness: 0.3, clearcoat: 0.6 }));
        base.castShadow = true; helix.add(base); spheres.push({ mesh: base, side: side ? 3 : 2, idx: i });
        const lab = labelSprite(side ? bp.b : bp.a, "#fff", 0.62); helix.add(lab); labs.push(lab); (lab as any).userData = { side, idx: i };
      }
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 10), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, transparent: true, opacity: 0.55 }));
      helix.add(rung); rungs.push(rung);
    }
    // Base platform
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.25, 48), new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.5, metalness: 0.4 })); plat.position.y = -0.15; plat.receiveShadow = true; scene.add(plat);

    stage.setAnimation((t, dt) => {
      helix.rotation.y += dt * cfg.current.speed * 0.45;
      const unw = cfg.current.unwind / 100; // 0..1
      const twist = THREE.MathUtils.lerp(0.62, 0.06, unw); const spread = THREE.MathUtils.lerp(1.05, 1.65, unw); const rise = THREE.MathUtils.lerp(0.30, 0.34, unw);
      spheres.forEach(({ mesh, side, idx }) => {
        const y = 0.25 + idx * rise;
        if (side === 0 || side === 1) { const ang = idx * twist + (side ? Math.PI : 0); mesh.position.set(Math.cos(ang) * spread, y, Math.sin(ang) * spread); }
        else { const ang = idx * twist + (side === 3 ? Math.PI : 0); mesh.position.set(Math.cos(ang) * spread * 0.48, y, Math.sin(ang) * spread * 0.48); }
      });
      labs.forEach((lab: any) => { const { side, idx } = lab.userData; const y = 0.25 + idx * rise; const ang = idx * twist + (side ? Math.PI : 0); lab.position.set(Math.cos(ang) * spread * 0.48, y + 0.32, Math.sin(ang) * spread * 0.48); lab.visible = cfg.current.labels; });
      rungs.forEach((r, i) => { const y = 0.25 + i * rise; const ang = i * twist; r.position.set(0, y, 0); r.rotation.z = Math.PI / 2; r.rotation.y = -ang; r.scale.y = spread * 0.96; });
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint /><div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-500/70 px-2.5 py-1">A</span><span className="rounded-full bg-amber-500/70 px-2.5 py-1">T</span><span className="rounded-full bg-blue-500/70 px-2.5 py-1">G</span><span className="rounded-full bg-pink-500/70 px-2.5 py-1">C</span><span className="rounded-full bg-black/55 px-2.5 py-1">Purple / Cyan = Sugar-Phosphate Backbone</span></div></div>
      <div className="space-y-4">
        <Panel title="Helix Controls"><Slider label="Unwind Helix" value={unwind} min={0} max={100} unit="%" onChange={setUnwind} /><Slider label="Rotation Speed" value={speed} min={0} max={3} step={0.5} unit="x" onChange={setSpeed} /><button onClick={() => setLabels(!labels)} className={`w-full rounded-lg py-2 text-sm font-semibold ${labels ? "bg-white text-slate-900" : "bg-white/5"}`}>Base Labels {labels ? "ON" : "OFF"}</button></Panel>
        <div className="grid grid-cols-2 gap-3"><Stat label="Base Pairs Shown" value="18" /><Stat label="Per Full Turn" value="10 pairs" sub="3.4 nm per turn" /><Stat label="A = T Bonds" value="2 H-bonds" /><Stat label="G ≡ C Bonds" value="3 H-bonds" /></div>
        <div className="rounded-3xl bg-pink-500/10 p-4 text-sm leading-relaxed text-pink-100/90 ring-1 ring-pink-400/20"><b>Unwind it:</b> Drag Unwind to 100% - this is what enzymes do during replication. Notice A always faces T and G always faces C. That pairing rule is how DNA copies itself accurately.</div>
      </div>
    </div>
  );
}
