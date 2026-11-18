"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";
import { Crosshair } from "lucide-react";

export default function Projectile() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ angle: 45, speed: 18, target: 28 });
  const fireRef = useRef<() => void>(() => {});
  const [angle, setAngle] = useState(45); const [speed, setSpeed] = useState(18); const [target, setTarget] = useState(28);
  const [result, setResult] = useState<{ range: number; height: number; hit: boolean | null }>({ range: 0, height: 0, hit: null });
  useEffect(() => { cfg.current = { angle, speed, target }; }, [angle, speed, target]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { camPos: [10, 7, 16], target: [11, 1.5, 0] });
    const { scene } = stage; floor(scene, 60);
    // Cannon
    const cannon = new THREE.Group(); scene.add(cannon);
    const baseM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 })); baseM.position.y = 0.25; baseM.castShadow = true; cannon.add(baseM);
    const barrel = new THREE.Group(); barrel.position.y = 0.6; cannon.add(barrel);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.8, 24), new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.25 })); tube.rotation.z = Math.PI / 2; tube.position.x = 0.7; tube.castShadow = true; barrel.add(tube);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xf97316, metalness: 0.2, roughness: 0.3, clearcoat: 0.8 })); ball.castShadow = true; ball.position.set(0.5, 0.6, 0); scene.add(ball);
    // Target - rings
    const targetG = new THREE.Group(); scene.add(targetG);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })); pole.position.y = 0.8; targetG.add(pole);
    [[0.75, 0xef4444], [0.55, 0xffffff], [0.35, 0xef4444], [0.16, 0xfbbf24]].forEach(([r, c]) => { const ring = new THREE.Mesh(new THREE.CircleGeometry(r as number, 40), new THREE.MeshStandardMaterial({ color: c as number, roughness: 0.6, side: THREE.DoubleSide })); ring.position.y = 1.9; ring.rotation.y = -Math.PI / 2; targetG.add(ring); });
    // Trajectory line
    const lineGeo = new THREE.BufferGeometry(); const pts = new Float32Array(200 * 3); lineGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xfb923c })); scene.add(line);
    let flying = false; let pos = new THREE.Vector3(); let vel = new THREE.Vector3(); let trailN = 0; let elapsed = 0;
    fireRef.current = () => {
      const { angle: a, speed: v } = cfg.current; const rad = THREE.MathUtils.degToRad(a);
      pos.set(1.4, 0.75, 0); vel.set(Math.cos(rad) * v, Math.sin(rad) * v, 0); flying = true; trailN = 0; elapsed = 0;
      pts.fill(0); lineGeo.attributes.position.needsUpdate = true; lineGeo.setDrawRange(0, 0);
    };
    stage.setAnimation((t, dt) => {
      barrel.rotation.z = THREE.MathUtils.degToRad(cfg.current.angle);
      targetG.position.x = cfg.current.target;
      if (!flying) { ball.position.set(0.5 + Math.cos(THREE.MathUtils.degToRad(cfg.current.angle)) * 0.9, 0.6 + Math.sin(THREE.MathUtils.degToRad(cfg.current.angle)) * 0.9, 0); return; }
      const h = Math.min(dt, 0.033); vel.y -= 9.8 * h; pos.addScaledVector(vel, h); elapsed += h;
      ball.position.copy(pos);
      if (trailN < 200) { pts[trailN * 3] = pos.x; pts[trailN * 3 + 1] = pos.y; pts[trailN * 3 + 2] = pos.z; trailN++; lineGeo.setDrawRange(0, trailN); lineGeo.attributes.position.needsUpdate = true; }
      if (pos.y <= 0.28) {
        pos.y = 0.28; flying = false;
        const range = pos.x; const hit = Math.abs(range - cfg.current.target) < 1.6;
        const v = cfg.current.speed, a = THREE.MathUtils.degToRad(cfg.current.angle);
        setResult({ range, height: (v * v * Math.sin(a) * Math.sin(a)) / (2 * 9.8), hit });
        if (hit) targetG.scale.setScalar(1.15); setTimeout(() => targetG.scale.setScalar(1), 350);
      }
    });
    return () => stage.dispose();
  }, []);

  const rad = THREE.MathUtils.degToRad(angle); const theoryRange = (speed * speed * Math.sin(2 * rad)) / 9.8; const theoryH = (speed * speed * Math.sin(rad) ** 2) / (2 * 9.8);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        {result.hit !== null && <div className={`absolute right-3 top-3 rounded-full px-4 py-2 font-bold backdrop-blur ${result.hit ? "bg-emerald-500/85" : "bg-black/60"}`}>{result.hit ? "🎯 Bullseye! Target hit" : `Landed at ${result.range.toFixed(1)} m - target at ${target} m`}</div>}
      </div>
      <div className="space-y-4">
        <Panel title="Launch Controls">
          <Slider label="Launch Angle" value={angle} min={10} max={80} unit="°" onChange={setAngle} />
          <Slider label="Initial Speed" value={speed} min={8} max={30} unit=" m/s" onChange={setSpeed} />
          <Slider label="Target Distance" value={target} min={10} max={55} unit=" m" onChange={setTarget} />
          <button onClick={() => fireRef.current()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 font-bold hover:opacity-90 transition"><Crosshair className="size-4" /> FIRE</button>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Predicted Range" value={`${theoryRange.toFixed(1)} m`} sub="R = v²sin2θ/g" />
          <Stat label="Max Height" value={`${theoryH.toFixed(1)} m`} />
          <Stat label="Last Landing" value={result.range ? `${result.range.toFixed(1)} m` : "-"} />
          <Stat label="Flight Target" value={`${target} m`} sub="Hit within ±1.6 m" />
        </div>
        <div className="rounded-3xl bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-100/90 ring-1 ring-orange-400/20"><b>Challenge:</b> Set speed to 18 m/s. Which angle hits a target at 33 m? Hint - range is maximum near 45°. Try 30° and 60°, they land at the same place.</div>
      </div>
    </div>
  );
}
