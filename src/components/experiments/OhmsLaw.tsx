"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";

export default function OhmsLaw() {
  const mount = useRef<HTMLDivElement>(null);
  const graph = useRef<HTMLCanvasElement>(null);
  const cfg = useRef({ v: 6, r: 6, on: true });
  const [v, setV] = useState(6); const [r, setR] = useState(6); const [on, setOn] = useState(true);
  const [points, setPoints] = useState<{ v: number; i: number }[]>([]);
  useEffect(() => { cfg.current = { v, r, on }; }, [v, r, on]);
  const current = on ? v / r : 0;

  useEffect(() => {
    const cv = graph.current; if (!cv) return; const ctx = cv.getContext("2d")!; const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H); ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.strokeRect(28, 8, W - 38, H - 34);
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px Inter"; ctx.fillText("V (volts) →", W - 90, H - 6); ctx.fillText("I (A)", 2, 14);
    if (points.length > 1) { ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(28, H - 26); ctx.lineTo(28 + (12 / 12) * (W - 38) * (points[points.length - 1].v / 12), H - 26); ctx.stroke();
      ctx.beginPath(); const sorted = [...points].sort((a, b) => a.v - b.v); sorted.forEach((p, idx) => { const x = 28 + (p.v / 12) * (W - 38), y = (H - 26) - (p.i / 3) * (H - 34); idx ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = "#22d3ee"; ctx.stroke(); }
    points.forEach(p => { const x = 28 + (p.v / 12) * (W - 38), y = (H - 26) - (p.i / 3) * (H - 34); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); });
  }, [points]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [5.5, 4.5, 7.5], target: [0, 1, 0] });
    const { scene } = stage; floor(scene, 22);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 4.6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })); bench.position.y = 0.55; bench.castShadow = bench.receiveShadow = true; scene.add(bench);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.3 });
    const wire = (a: THREE.Vector3, b: THREE.Vector3) => { const len = a.distanceTo(b); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), wireMat); m.position.copy(a).lerp(b, 0.5); m.lookAt(b); m.rotateX(Math.PI / 2); scene.add(m); };
    const Y = 1.05;
    // Battery (left)
    const batt = new THREE.Group(); batt.position.set(-3.4, Y, -1.2); scene.add(batt);
    const bbody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.3 })); bbody.castShadow = true; batt.add(bbody);
    const btop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.9), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })); btop.position.y = 0.4; batt.add(btop);
    const bl = labelSprite("BATTERY", "#fca5a5", 0.8); bl.position.set(-3.4, Y + 0.95, -1.2); scene.add(bl);
    // Resistor coil (top centre) - helix of wire
    const coilPts: THREE.Vector3[] = []; for (let i = 0; i <= 120; i++) { const t = i / 120; coilPts.push(new THREE.Vector3(-1.1 + t * 2.2, Y + 0.55 + Math.sin(t * Math.PI * 14) * 0.16, -1.2 + Math.cos(t * Math.PI * 14) * 0.16)); }
    const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 200, 0.045, 8), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25, emissive: 0x000000 }));
    coil.castShadow = true; scene.add(coil);
    const rl = labelSprite("RESISTOR (wire)", "#fcd34d", 0.8); rl.position.set(0, Y + 1.25, -1.2); scene.add(rl);
    // Ammeter + Voltmeter boxes with needles
    const meter = (x: number, z: number, letter: string, color: string) => {
      const g = new THREE.Group(); g.position.set(x, Y + 0.1, z); scene.add(g);
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.85, 0.35), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })); box.castShadow = true; g.add(box);
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.33, 32), new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.6 })); face.position.set(0, 0.05, 0.19); g.add(face);
      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.3, 0.01), new THREE.MeshBasicMaterial({ color: 0xdc2626 })); needle.geometry.translate(0, 0.13, 0); needle.position.set(0, 0.05, 0.21); g.add(needle);
      const l = labelSprite(letter, color, 0.75); l.position.set(x, Y + 0.85, z); scene.add(l);
      return needle;
    };
    const aNeedle = meter(2.6, -1.2, "A  AMMETER", "#7dd3fc");
    const vNeedle = meter(0, 1.35, "V  VOLTMETER", "#fda4af");
    // Rheostat (bottom right) with slider knob
    const rheo = new THREE.Group(); rheo.position.set(2.6, Y, 1.35); scene.add(rheo);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.0, 14), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.25 })); rod.rotation.z = Math.PI / 2; rheo.add(rod);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.42), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3, metalness: 0.4 })); knob.position.y = 0.25; rheo.add(knob);
    const rheoL = labelSprite("RHEOSTAT", "#7dd3fc", 0.8); rheoL.position.set(2.6, Y + 0.95, 1.35); scene.add(rheoL);
    // Circuit wires (rectangle loop + voltmeter branch)
    wire(new THREE.Vector3(-2.6, Y + 0.2, -1.2), new THREE.Vector3(-1.2, Y + 0.55, -1.2));
    wire(new THREE.Vector3(1.2, Y + 0.55, -1.2), new THREE.Vector3(2.0, Y + 0.2, -1.2));
    wire(new THREE.Vector3(3.2, Y + 0.2, -1.2), new THREE.Vector3(3.6, Y + 0.2, 0));
    wire(new THREE.Vector3(3.6, Y + 0.2, 0), new THREE.Vector3(3.6, Y + 0.2, 1.35));
    wire(new THREE.Vector3(1.6, Y + 0.2, 1.35), new THREE.Vector3(-3.4, Y + 0.2, 1.35));
    wire(new THREE.Vector3(-3.4, Y + 0.2, 1.35), new THREE.Vector3(-3.4, Y + 0.2, -0.7));
    wire(new THREE.Vector3(-1.1, Y + 0.3, -0.9), new THREE.Vector3(-0.4, Y + 0.3, 1.1));
    wire(new THREE.Vector3(1.1, Y + 0.3, -0.9), new THREE.Vector3(0.4, Y + 0.3, 1.1));
    // Current flow dots
    const dots: THREE.Mesh[] = []; const dotGeo = new THREE.SphereGeometry(0.06, 10, 8); const dotMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(dotGeo, dotMat); scene.add(d); dots.push(d); }
    const path = [new THREE.Vector3(-2.6, Y + 0.2, -1.2), new THREE.Vector3(1.9, Y + 0.45, -1.2), new THREE.Vector3(3.6, Y + 0.2, -1.2), new THREE.Vector3(3.6, Y + 0.2, 1.35), new THREE.Vector3(-3.4, Y + 0.2, 1.35), new THREE.Vector3(-3.4, Y + 0.2, -1.2)];
    const curve = new THREE.CatmullRomCurve3(path, true);

    stage.setAnimation((t) => {
      const { v: V, r: R, on: ON } = cfg.current; const I = ON ? V / R : 0;
      aNeedle.rotation.z = THREE.MathUtils.lerp(aNeedle.rotation.z, -0.9 + Math.min(I / 3, 1) * 1.8, 0.1);
      vNeedle.rotation.z = THREE.MathUtils.lerp(vNeedle.rotation.z, -0.9 + (ON ? V / 12 : 0) * 1.8, 0.1);
      knob.position.x = -0.8 + (R / 24) * 1.6;
      (coil.material as THREE.MeshStandardMaterial).emissive.setHSL(0.07, 0.9, ON ? Math.min(I * I * R * 0.012, 0.35) : 0);
      dots.forEach((d, i) => { const u = (t * 0.06 * (0.3 + I) + i / dots.length) % 1; d.position.copy(curve.getPointAt(u)); d.visible = ON && I > 0; });
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className="absolute bottom-3 left-3 w-[340px] rounded-2xl bg-black/55 p-3 backdrop-blur"><p className="mb-1 text-xs font-bold text-slate-300">V-I Graph - slope = Resistance</p><canvas ref={graph} width={320} height={130} className="h-[130px] w-full" /></div>
      </div>
      <div className="space-y-4">
        <Panel title="Circuit Controls">
          <button onClick={() => setOn(!on)} className={`w-full rounded-xl py-2.5 font-bold transition ${on ? "bg-emerald-500" : "bg-white/10"}`}>{on ? "Switch ON" : "Switch OFF"}</button>
          <Slider label="Battery Voltage" value={v} min={1.5} max={12} step={1.5} unit=" V" onChange={setV} />
          <Slider label="Wire Resistance" value={r} min={2} max={24} step={1} unit=" Ω" onChange={setR} />
          <button onClick={() => on && setPoints(p => [...p.filter(x => x.v !== v), { v, i: current }].slice(-10))} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 font-bold hover:opacity-90">Record Reading (V, I)</button>
          {points.length > 0 && <button onClick={() => setPoints([])} className="w-full rounded-xl bg-white/5 py-2 text-sm font-semibold">Clear Graph ({points.length} points)</button>}
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Voltage" value={`${on ? v : 0} V`} /><Stat label="Current" value={`${current.toFixed(2)} A`} />
          <Stat label="Resistance" value={`${r} Ω`} sub="Slope of V-I graph" /><Stat label="Power" value={`${(v * current).toFixed(1)} W`} sub="P = VI" />
        </div>
        <div className="rounded-3xl bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100/90 ring-1 ring-amber-400/20"><b>Verify it:</b> Record readings at 3-4 voltages. Every point sits on one straight line through zero - that is Ohm's law. Double R and the line gets half as steep.</div>
      </div>
    </div>
  );
}
