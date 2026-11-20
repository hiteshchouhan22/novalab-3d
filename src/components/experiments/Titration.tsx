"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite, loadModel } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";
import { Droplets, Play, Pause, RotateCcw } from "lucide-react";

// Hidden strength of the KMnO4 in the burette - the student must find it.
const KMNO4_M = 0.04; // mol/L
const OXALIC_M = 0.1, OXALIC_V = 25; // mL in flask
// Stoichiometry: 2 KMnO4 reacts with 5 oxalic acid -> endpoint V = (2/5)*(Mox*Vox)/Mkmno4
const ENDPOINT_V = (2 / 5) * (OXALIC_M * OXALIC_V) / KMNO4_M; // = 25.0 mL

export default function Titration() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ running: false, rate: 1, vol: 0, reset: 0 });
  const [running, setRunning] = useState(false);
  const [rate, setRate] = useState(1);
  const [vol, setVol] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { cfg.current.running = running; }, [running]);
  useEffect(() => { cfg.current.rate = rate; }, [rate]);
  const stage2 = vol < ENDPOINT_V - 0.4 ? 0 : vol <= ENDPOINT_V + 1.2 ? 1 : 2; // 0 colourless, 1 endpoint pink, 2 overshot
  useEffect(() => { if (stage2 === 1) setRunning(false); }, [stage2]);

  const reset = () => { cfg.current.vol = 0; cfg.current.reset++; setVol(0); setRunning(false); setChecked(null); setAnswer(""); };

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [3.6, 3.4, 5.6], target: [0, 2.1, 0] });
    const { scene } = stage; floor(scene, 18);
    const metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 });
    // Imported Blender models (CHEMOVATE VCL) - stand, balance, flask, pipette, beaker
    loadModel("burette-stand", 4.9).then(m => { m.position.set(0, 0, -0.3); scene.add(m); }).catch(() => {});
    loadModel("balance", 1.5).then(m => { m.position.set(-2.6, 0, 0.8); m.rotation.y = 0.5; scene.add(m); const l = labelSprite("Analytical Balance", "#e2e8f0", 0.75); l.position.set(-2.6, 1.85, 0.8); scene.add(l); }).catch(() => {});
    loadModel("pipette", 1.9).then(m => { m.rotation.z = Math.PI / 2.15; m.position.set(2.1, 0.12, 1.0); scene.add(m); }).catch(() => {});
    loadModel("beaker", 1.0).then(m => { m.position.set(2.5, 0, -0.7); scene.add(m); }).catch(() => {});
    // Burette: glass tube + purple liquid column + tip
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.25, roughness: 0.05, transmission: 0.5 });
    const burette = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 24, 1, true), glassMat); burette.position.set(0, 3.6, 0); scene.add(burette);
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 1, 20), new THREE.MeshPhysicalMaterial({ color: 0xa21caf, transparent: true, opacity: 0.9, roughness: 0.15 }));
    liquid.geometry.translate(0, 0.5, 0); scene.add(liquid);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.5, 12), glassMat); tip.position.set(0, 2.05, 0); scene.add(tip);
    const tap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.09), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3 })); tap.position.set(0, 2.32, 0); scene.add(tap);
    for (let i = 0; i <= 5; i++) { const tick = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0x334155 })); tick.position.set(0.145, 4.7 - i * 0.42, 0); scene.add(tick); }
    const bl = labelSprite("KMnO₄ (burette)", "#f0abfc", 0.85); bl.position.set(0, 5.25, 0); scene.add(bl);
    // Conical flask - imported model, with live liquid inside
    loadModel("conical-flask", 1.55).then(m => { m.position.set(0, 0.1, 0); scene.add(m); }).catch(() => {});
    const flaskLiquidMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.8, roughness: 0.1 });
    const flaskLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.44, 0.5, 28), flaskLiquidMat); flaskLiquid.position.set(0, 0.38, 0); scene.add(flaskLiquid);
    const fl = labelSprite("Oxalic acid 25 mL, 0.1 M", "#e2e8f0", 0.8); fl.position.set(0, -0.0 + 0.0, 0); fl.position.set(1.85, 0.7, 0); scene.add(fl);
    // Burner with flame
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.3, 16), metal); burner.position.set(0, -0.0, 0); burner.position.set(-1.15, 0.15, 0.7); scene.add(burner);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 2.4 })); flame.scale.y = 1.8; flame.position.set(-1.15, 0.5, 0.7); scene.add(flame);
    // Drops
    const drops: THREE.Mesh[] = []; const dropGeo = new THREE.SphereGeometry(0.035, 10, 8); const dropMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
    for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(dropGeo, dropMat); d.visible = false; scene.add(d); drops.push(d); }
    let lastUi = 0;
    stage.setAnimation((t, dt) => {
      flame.scale.y = 1.8 + Math.sin(t * 12) * 0.15;
      const c = cfg.current;
      if (c.running && c.vol < 50) { c.vol = Math.min(50, c.vol + dt * 1.6 * c.rate); }
      // liquid column: 50 mL capacity mapped to 2.1 units
      const frac = 1 - c.vol / 50; liquid.scale.y = Math.max(frac * 2.1, 0.01); liquid.position.y = 2.32;
      tap.rotation.y = c.running ? Math.PI / 5 : 0;
      const st = c.vol < ENDPOINT_V - 0.4 ? 0 : c.vol <= ENDPOINT_V + 1.2 ? 1 : 2;
      const target = st === 0 ? new THREE.Color(0xf8fafc) : st === 1 ? new THREE.Color(0xf9a8d4) : new THREE.Color(0xc026d3);
      flaskLiquidMat.color.lerp(target, 0.06);
      drops.forEach((d, i) => { if (!c.running) { d.visible = false; return; } const ph = (t * (1.2 + c.rate) + i / drops.length) % 1; d.visible = ph < 0.55; d.position.set(0, 1.85 - ph * 1.05, 0); d.scale.y = 1.4; });
      if (t - lastUi > 0.12) { lastUi = t; setVol(Math.round(c.vol * 10) / 10); }
    });
    return () => stage.dispose();
  }, []);

  const check = () => { const val = parseFloat(answer); if (isNaN(val)) return; setChecked(Math.abs(val - KMNO4_M) <= 0.008); };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className={`absolute right-3 top-3 rounded-full px-4 py-2 font-bold backdrop-blur ${stage2 === 1 ? "bg-pink-500/85" : stage2 === 2 ? "bg-fuchsia-700/85" : "bg-black/60"}`}>{stage2 === 0 ? "Flask: colourless - keep going" : stage2 === 1 ? "Endpoint! First permanent pink" : "Overshot! Too much KMnO4 - reset and retry"}</div>
      </div>
      <div className="space-y-4">
        <Panel title="Burette Controls">
          <div className="flex gap-2">
            <button onClick={() => setRunning(!running)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 py-2.5 font-bold hover:opacity-90">{running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? "Close Tap" : "Open Tap"}</button>
            <button onClick={reset} className="grid size-11 place-items-center rounded-xl bg-white/10 hover:bg-white/15" title="Reset"><RotateCcw className="size-4" /></button>
          </div>
          <Slider label="Drop Rate" value={rate} min={0.2} max={3} step={0.2} unit="x" onChange={setRate} />
          <p className="flex items-center gap-1.5 text-xs text-slate-400"><Droplets className="size-3.5" /> Slow down below 20 mL - the endpoint comes suddenly.</p>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Burette Used" value={`${vol.toFixed(1)} mL`} sub="KMnO4 volume V2" />
          <Stat label="In Flask" value="25 mL" sub="Oxalic acid, 0.1 M" />
        </div>
        <Panel title="Your Result">
          <p className="text-xs leading-relaxed text-slate-400">2 KMnO₄ reacts with 5 oxalic acid. M(KMnO₄) = (2/5) × (0.1 × 25) / V2. Enter your calculated molarity:</p>
          <div className="flex gap-2"><input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="e.g. 0.04" inputMode="decimal" className="w-full rounded-xl bg-white/5 px-3 py-2.5 font-mono text-sm ring-1 ring-white/10 outline-none focus:ring-fuchsia-400" /><button onClick={check} className="shrink-0 rounded-xl bg-white px-4 font-bold text-slate-900">Check</button></div>
          {checked !== null && <p className={`rounded-xl px-3 py-2 text-sm font-semibold ${checked ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}>{checked ? `Correct! KMnO4 is ${KMNO4_M} M - strength = ${(KMNO4_M * 158).toFixed(2)} g/L.` : "Not quite - check your burette reading and the 2/5 factor, then try again."}</p>}
        </Panel>
      </div>
    </div>
  );
}
