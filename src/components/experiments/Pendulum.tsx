"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor } from "@/lib/three-base";
import { Panel, PlayBar, Slider, Stat, ViewportHint } from "@/components/ui";

const GRAVITIES = [{ name: "Earth", g: 9.8 }, { name: "Moon", g: 1.6 }, { name: "Mars", g: 3.7 }, { name: "Jupiter", g: 24.8 }];

export default function Pendulum() {
  const mount = useRef<HTMLDivElement>(null);
  const state = useRef({ playing: true, length: 2.2, angle: 35, g: 9.8, theta: 0, omega: 0, time: 0 });
  const [playing, setPlaying] = useState(true);
  const [length, setLength] = useState(2.2);
  const [angleDeg, setAngleDeg] = useState(35);
  const [planet, setPlanet] = useState(GRAVITIES[0]);
  const [readout, setReadout] = useState({ period: 0, measured: 0, swings: 0 });
  const graph = useRef<HTMLCanvasElement>(null);
  const history = useRef<number[]>([]);

  useEffect(() => { state.current.length = length; }, [length]);
  useEffect(() => { state.current.g = planet.g; }, [planet]);

  const reset = () => { const s = state.current; s.theta = THREE.MathUtils.degToRad(angleDeg); s.omega = 0; s.time = 0; history.current = []; setReadout(r => ({ ...r, swings: 0 })); };
  useEffect(() => { reset(); }, [angleDeg]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [4.5, 3.2, 6.5], target: [0, 2.2, 0] });
    const { scene } = stage;
    floor(scene, 24);
    // Frame - brushed metal stand
    const metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 1.2), dark); base.position.y = 0.09; base.castShadow = base.receiveShadow = true; scene.add(base);
    for (const x of [-1.5, 1.5]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 20), metal); post.position.set(x, 2.3, 0); post.castShadow = true; scene.add(post); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.2, 20), metal); bar.rotation.z = Math.PI / 2; bar.position.y = 4.6; bar.castShadow = true; scene.add(bar);

    const pivot = new THREE.Group(); pivot.position.set(0, 4.6, 0); scene.add(pivot);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 12), rodMat); rod.castShadow = true; pivot.add(rod);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.18, clearcoat: 0.6 }));
    bob.castShadow = true; pivot.add(bob);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), dark); pivot.add(hub);
    // Trail
    const trailGeo = new THREE.BufferGeometry(); const trailPos = new Float32Array(120 * 3); trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 })); scene.add(trail);
    let trailIdx = 0; let lastCross = 0; let swings = 0; let lastPeriod = 0; let prevTheta = state.current.theta;

    stage.setAnimation((t, dt) => {
      const s = state.current;
      if (s.playing) {
        const steps = 4; const h = Math.min(dt, 0.033) / steps;
        for (let i = 0; i < steps; i++) { const alpha = -(s.g / s.length) * Math.sin(s.theta); s.omega += alpha * h; s.theta += s.omega * h; s.time += h; }
        if (prevTheta < 0 && s.theta >= 0 && s.omega > 0) { if (lastCross > 0) { lastPeriod = s.time - lastCross; swings++; } lastCross = s.time; }
        prevTheta = s.theta;
        history.current.push(s.theta); if (history.current.length > 220) history.current.shift();
        // graph
        const cv = graph.current; if (cv) { const ctx = cv.getContext("2d")!; const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H); ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.strokeStyle = "#818cf8"; ctx.lineWidth = 2; ctx.beginPath(); history.current.forEach((v, i) => { const x = (i / 219) * W, y = H / 2 - v * (H * 0.38); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
        if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) setReadout({ period: 2 * Math.PI * Math.sqrt(s.length / s.g), measured: lastPeriod, swings });
      }
      pivot.rotation.z = s.theta;
      const L = s.length * 1.4;
      rod.scale.y = L; rod.position.y = -L / 2; bob.position.y = -L;
      const bp = new THREE.Vector3(); bob.getWorldPosition(bp);
      trailPos[trailIdx * 3] = bp.x; trailPos[trailIdx * 3 + 1] = bp.y; trailPos[trailIdx * 3 + 2] = bp.z; trailIdx = (trailIdx + 1) % 120; trailGeo.attributes.position.needsUpdate = true;
    });
    state.current.theta = THREE.MathUtils.degToRad(angleDeg);
    return () => stage.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theory = 2 * Math.PI * Math.sqrt(length / planet.g);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint /><div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-[420px] rounded-2xl bg-black/55 p-3 backdrop-blur"><p className="mb-1 text-xs font-bold text-slate-300">Displacement vs Time - Simple Harmonic Motion</p><canvas ref={graph} width={400} height={90} className="h-[90px] w-full" /></div></div>
      <div className="space-y-4">
        <Panel title="Controls"><PlayBar playing={playing} onPlay={() => { state.current.playing = !playing; setPlaying(!playing); }} onReset={reset} />
          <Slider label="String Length" value={length} min={0.8} max={3.5} step={0.1} unit=" m" onChange={setLength} />
          <Slider label="Release Angle" value={angleDeg} min={5} max={60} unit="°" onChange={setAngleDeg} />
          <div><p className="mb-1.5 text-sm font-medium text-slate-300">Gravity - Planet</p><div className="grid grid-cols-4 gap-1.5">{GRAVITIES.map(p => <button key={p.name} onClick={() => setPlanet(p)} className={`rounded-lg py-2 text-xs font-bold ${planet.name === p.name ? "bg-indigo-500 text-white" : "bg-white/5 hover:bg-white/10"}`}>{p.name}<br /><span className="font-mono font-normal opacity-80">{p.g}</span></button>)}</div></div>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Theory Period" value={`${theory.toFixed(2)} s`} sub="T = 2π√(L/g)" />
          <Stat label="Measured" value={readout.measured ? `${readout.measured.toFixed(2)} s` : "-"} sub={`${readout.swings} full swings`} />
          <Stat label="Frequency" value={`${(1 / theory).toFixed(2)} Hz`} />
          <Stat label="Gravity" value={`${planet.g} m/s²`} sub={planet.name} />
        </div>
        <div className="rounded-3xl bg-indigo-500/10 p-4 text-sm leading-relaxed text-indigo-100/90 ring-1 ring-indigo-400/20"><b>Observe:</b> Mass does not appear in the formula. Double the length - period grows by √2, not 2. Try Moon gravity and feel how slow it swings.</div>
      </div>
    </div>
  );
}
