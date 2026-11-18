"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, labelSprite } from "@/lib/three-base";
import { Panel, Slider, Stat } from "@/components/ui";

const PLANETS = [
  { name: "Mercury", color: 0x9ca3af, size: 0.32, dist: 4, period: 0.24, fact: "Fastest planet - a year is only 88 days." },
  { name: "Venus", color: 0xf59e0b, size: 0.55, dist: 5.8, period: 0.62, fact: "Hottest planet, spins backwards." },
  { name: "Earth", color: 0x3b82f6, size: 0.58, dist: 7.8, period: 1, fact: "Only known planet with life." },
  { name: "Mars", color: 0xef4444, size: 0.45, dist: 9.8, period: 1.88, fact: "Has the tallest volcano, Olympus Mons." },
  { name: "Jupiter", color: 0xd6a35c, size: 1.35, dist: 13.5, period: 11.9, fact: "Great Red Spot is a storm bigger than Earth." },
  { name: "Saturn", color: 0xe7c98a, size: 1.15, dist: 17.5, period: 29.4, fact: "Its rings are mostly ice particles." },
  { name: "Uranus", color: 0x67e8f9, size: 0.85, dist: 21.5, period: 84, fact: "Rotates on its side at 98 degrees." },
  { name: "Neptune", color: 0x2563eb, size: 0.82, dist: 25, period: 164.8, fact: "Fastest winds in the solar system." },
];

export default function SolarSystem() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ speed: 1, focus: -1 });
  const [speed, setSpeed] = useState(1); const [selected, setSelected] = useState<typeof PLANETS[2] | null>(PLANETS[2]);
  useEffect(() => { cfg.current.speed = speed; }, [speed]);
  useEffect(() => { cfg.current.focus = selected ? PLANETS.findIndex(p => p.name === selected.name) : -1; }, [selected]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { bg: 0x020617, camPos: [0, 16, 26], target: [0, 0, 0] });
    stage.scene.fog = null;
    const { scene, camera, controls } = stage;
    // Stars
    const starGeo = new THREE.BufferGeometry(); const sp = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) { const r = 70 + Math.random() * 60, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1); sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.cos(ph) * 0.6; sp[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th); }
    starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true })));
    // Sun
    const sun = new THREE.Mesh(new THREE.SphereGeometry(2.1, 48, 32), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 2.2, roughness: 1 }));
    scene.add(sun); scene.add(new THREE.PointLight(0xffe9b0, 900, 120, 1.6));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2.7, 32, 24), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.14, side: THREE.BackSide })); scene.add(glow);

    const groups: THREE.Group[] = []; const meshes: THREE.Mesh[] = [];
    PLANETS.forEach((p, i) => {
      const orbit = new THREE.Mesh(new THREE.RingGeometry(p.dist - 0.03, p.dist + 0.03, 96), new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
      orbit.rotation.x = Math.PI / 2; scene.add(orbit);
      const g = new THREE.Group(); scene.add(g); groups.push(g);
      const m = new THREE.Mesh(new THREE.SphereGeometry(p.size, 36, 24), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.75, metalness: 0.05 }));
      m.position.x = p.dist; m.castShadow = false; g.add(m); meshes.push(m);
      const lab = labelSprite(p.name, "#e2e8f0", 0.85); lab.position.set(p.dist, p.size + 0.65, 0); g.add(lab);
      if (p.name === "Saturn") { const ring = new THREE.Mesh(new THREE.RingGeometry(p.size * 1.45, p.size * 2.25, 64), new THREE.MeshBasicMaterial({ color: 0xd6c08a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); ring.rotation.x = Math.PI / 2.4; ring.position.x = p.dist; g.add(ring); }
      if (p.name === "Earth") { const moon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9 })); moon.name = "moon"; g.add(moon); }
      g.rotation.y = i * 1.15;
    });

    stage.setAnimation((t, dt) => {
      sun.rotation.y += dt * 0.02;
      groups.forEach((g, i) => { g.rotation.y += dt * cfg.current.speed * 0.55 / PLANETS[i].period; meshes[i].rotation.y += dt * 0.6; });
      const earth = groups[2]; const moon = earth.getObjectByName("moon") as THREE.Mesh; if (moon) { const a = t * 1.4; moon.position.set(7.8 + Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05); }
      const f = cfg.current.focus;
      if (f >= 0) { const wp = new THREE.Vector3(); meshes[f].getWorldPosition(wp); controls.target.lerp(wp, 0.06); }
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs backdrop-blur">Drag to orbit the solar system • Click a planet on the right to focus</div></div>
      <div className="space-y-4">
        <Panel title="Time Controls"><Slider label="Time Speed" value={speed} min={0} max={5} step={0.5} unit="x" onChange={setSpeed} /><p className="text-xs leading-relaxed text-slate-400">At 1x, Earth completes one orbit in about 11 seconds so you can compare all planets fairly.</p></Panel>
        <Panel title="Planets - tap to focus"><div className="grid grid-cols-2 gap-1.5">{PLANETS.map(p => <button key={p.name} onClick={() => setSelected(p)} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${selected?.name === p.name ? "bg-cyan-500/25 ring-1 ring-cyan-400" : "bg-white/5 hover:bg-white/10"}`}><span className="mr-1.5 inline-block size-2.5 rounded-full" style={{ background: `#${p.color.toString(16).padStart(6, "0")}` }} />{p.name}</button>)}</div></Panel>
        {selected && <><div className="grid grid-cols-2 gap-3"><Stat label="Orbital Period" value={`${selected.period} yrs`} /><Stat label="Distance Order" value={`${PLANETS.indexOf(selected) + 1} / 8`} /></div><div className="rounded-3xl bg-cyan-500/10 p-4 text-sm leading-relaxed text-cyan-100/90 ring-1 ring-cyan-400/20"><b>{selected.name}:</b> {selected.fact}</div></>}
      </div>
    </div>
  );
}
