"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";

const SPRINGS = [{ name: "Soft", k: 20 }, { name: "Medium", k: 40 }, { name: "Stiff", k: 80 }];

export default function HookesLaw() {
  const mount = useRef<HTMLDivElement>(null);
  const graph = useRef<HTMLCanvasElement>(null);
  const cfg = useRef({ mass: 200, k: 40, kick: 0 });
  const [mass, setMass] = useState(200); const [spring, setSpring] = useState(SPRINGS[1]);
  const [points, setPoints] = useState<{ f: number; x: number }[]>([]);
  useEffect(() => { cfg.current.mass = mass; cfg.current.kick = performance.now(); }, [mass]);
  useEffect(() => { cfg.current.k = spring.k; cfg.current.kick = performance.now(); }, [spring]);
  const force = (mass / 1000) * 9.8; const ext = force / spring.k; // metres

  useEffect(() => {
    const cv = graph.current; if (!cv) return; const ctx = cv.getContext("2d")!; const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H); ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.strokeRect(28, 8, W - 38, H - 34);
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px Inter"; ctx.fillText("Extension x (m) →", W - 130, H - 6); ctx.fillText("F (N)", 2, 14);
    ctx.strokeStyle = "#84cc16"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(28, H - 26);
    const maxX = Math.max(0.3, ...points.map(p => p.x), ext); ctx.lineTo(28 + (W - 38), (H - 26) - (spring.k * maxX / 6) * (H - 34) > 8 ? (H - 26) - Math.min((spring.k * maxX) / 6, 1) * (H - 34) : 8); ctx.stroke();
    points.forEach(p => { const x = 28 + (p.x / Math.max(0.3, maxX)) * (W - 38), y = (H - 26) - (p.f / 6) * (H - 34); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); });
  }, [points, ext, spring]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [4.2, 3.4, 6], target: [0, 2.4, 0] });
    const { scene } = stage; floor(scene, 20);
    const metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.4, 16), metal); post.position.set(-1.8, 2.7, 0); post.castShadow = true; scene.add(post);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 14), metal); arm.rotation.z = Math.PI / 2; arm.position.set(-0.75, 5.35, 0); scene.add(arm);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 1.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })); base.position.set(-1.8, 0.08, 0); scene.add(base);
    // Ruler
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.34, 4.4, 0.04), new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.7 })); ruler.position.set(0.75, 2.6, -0.25); scene.add(ruler);
    for (let i = 0; i <= 10; i++) { const tick = new THREE.Mesh(new THREE.BoxGeometry(i % 5 === 0 ? 0.2 : 0.11, 0.018, 0.01), new THREE.MeshBasicMaterial({ color: 0x44403c })); tick.position.set(0.68, 4.7 - i * 0.42, -0.22); scene.add(tick); }
    const rl = labelSprite("SCALE (cm)", "#fde68a", 0.7); rl.position.set(0.75, 5.15, -0.25); scene.add(rl);
    // Spring - rebuilt as helix tube, scaled in Y for stretch
    const springGroup = new THREE.Group(); springGroup.position.set(0.3, 5.35, 0); scene.add(springGroup);
    const helixPts: THREE.Vector3[] = []; const coils = 9, R = 0.34;
    for (let i = 0; i <= 160; i++) { const t = i / 160; helixPts.push(new THREE.Vector3(Math.cos(t * coils * Math.PI * 2) * R, -t * 1.6, Math.sin(t * coils * Math.PI * 2) * R)); }
    const springMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 220, 0.038, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.25 }));
    springMesh.castShadow = true; springGroup.add(springMesh);
    // Hanger + mass block + pointer
    const load = new THREE.Group(); scene.add(load);
    const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), metal); load.add(hanger);
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.85), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 })); block.castShadow = true; block.position.y = -0.5; load.add(block);
    const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 })); pointer.rotation.z = Math.PI / 2; pointer.position.set(0.42, -0.1, -0.25); load.add(pointer);
    let vel = 0, stretch = 0.4;
    stage.setAnimation((t, dt) => {
      const target = 0.4 + ((cfg.current.mass / 1000) * 9.8 / cfg.current.k) * 2.4; // scene units
      // Damped spring physics for a natural bounce
      const stiff = 26, damp = 5.2; const acc = (target - stretch) * stiff - vel * damp; vel += acc * dt; stretch += vel * dt;
      springMesh.scale.y = stretch / 1.6;
      load.position.set(0.3, 5.35 - 1.6 * springMesh.scale.y - 0.12, 0);
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-4 py-2 font-bold backdrop-blur">Load: {mass} g</div>
        <div className="absolute bottom-3 left-3 w-[340px] rounded-2xl bg-black/55 p-3 backdrop-blur"><p className="mb-1 text-xs font-bold text-slate-300">Force vs Extension - slope = k</p><canvas ref={graph} width={320} height={120} className="h-[120px] w-full" /></div>
      </div>
      <div className="space-y-4">
        <Panel title="Spring Controls">
          <div><p className="mb-1.5 text-sm font-medium text-slate-300">Spring Stiffness</p><div className="grid grid-cols-3 gap-1.5">{SPRINGS.map(s => <button key={s.name} onClick={() => setSpring(s)} className={`rounded-lg py-2 text-sm font-bold ${spring.name === s.name ? "bg-lime-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{s.name}<span className="block text-[11px] font-medium opacity-80">{s.k} N/m</span></button>)}</div></div>
          <Slider label="Hanging Mass" value={mass} min={0} max={600} step={50} unit=" g" onChange={setMass} />
          <button onClick={() => setPoints(p => [...p.filter(x => x.f !== force), { f: force, x: ext }].slice(-8))} className="w-full rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 py-2.5 font-bold hover:opacity-90">Record Reading (F, x)</button>
          {points.length > 0 && <button onClick={() => setPoints([])} className="w-full rounded-xl bg-white/5 py-2 text-sm font-semibold">Clear Graph ({points.length} points)</button>}
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Force (Load)" value={`${force.toFixed(2)} N`} sub="F = mg" />
          <Stat label="Extension" value={`${(ext * 100).toFixed(1)} cm`} sub={`${ext.toFixed(3)} m`} />
          <Stat label="Spring Constant" value={`${spring.k} N/m`} />
          <Stat label="Check F/x" value={ext > 0 ? `${(force / ext).toFixed(0)} N/m` : "-"} sub="Should equal k" />
        </div>
        <div className="rounded-3xl bg-lime-500/10 p-4 text-sm leading-relaxed text-lime-100/90 ring-1 ring-lime-400/20"><b>Watch the bounce:</b> Add mass suddenly and the spring oscillates before settling - real springs do exactly this. Record 4 loads: F/x stays the same every time. That constant ratio is Hooke's law.</div>
      </div>
    </div>
  );
}
