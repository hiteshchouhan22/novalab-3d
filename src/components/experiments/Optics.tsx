"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage } from "@/lib/three-base";
import { Panel, Slider, Stat, ViewportHint } from "@/components/ui";

function line(pts: THREE.Vector3[], color: number, opacity = 0.95) {
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

export default function Optics() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ u: 14, f: 6 });
  const [u, setU] = useState(14); const [f, setF] = useState(6);
  useEffect(() => { cfg.current = { u, f }; }, [u, f]);
  const v = (f * u) / (u - f); const isVirtual = u < f; const mag = isVirtual ? (f / (f - u)) : -(v / u);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { bg: 0x0a0f1e, camPos: [0, 5.5, 13], target: [0, 1.2, 0] });
    const { scene } = stage; scene.fog = null;
    // Optical bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(26, 0.25, 1.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })); bench.position.y = 0.4; bench.receiveShadow = true; scene.add(bench);
    for (let i = -12; i <= 12; i += 2) { const tick = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 1.2), new THREE.MeshBasicMaterial({ color: 0x64748b })); tick.position.set(i, 0.54, 0); scene.add(tick); }
    const axis = line([new THREE.Vector3(-13, 1.6, 0), new THREE.Vector3(13, 1.6, 0)], 0x475569, 0.5); scene.add(axis);
    // Lens - biconvex shape via Lathe
    const pts: THREE.Vector2[] = []; for (let i = 0; i <= 20; i++) { const y = -1.5 + (i / 20) * 3; const x = 0.42 * Math.cos((y / 3) * Math.PI * 0.82); pts.push(new THREE.Vector2(Math.max(x, 0.02), y)); }
    const lens = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), new THREE.MeshPhysicalMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.38, roughness: 0.05, metalness: 0, transmission: 0.4, thickness: 0.6 }));
    lens.rotation.z = Math.PI / 2; lens.position.y = 1.6; lens.castShadow = true; scene.add(lens);
    const rimT = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.05, 12, 48), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 })); rimT.position.y = 1.6; scene.add(rimT);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })); stand.position.y = 0.95; scene.add(stand);
    // Candle (object)
    const candle = new THREE.Group(); scene.add(candle);
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.5, 20), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })); wax.position.y = 0.75; wax.castShadow = true; candle.add(wax);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 3 })); flame.scale.y = 1.7; flame.position.y = 1.68; candle.add(flame);
    candle.add(new THREE.PointLight(0xfbbf24, 8, 6));
    // Image arrow group - dynamic
    const dynamic = new THREE.Group(); scene.add(dynamic);

    stage.setAnimation((t) => {
      flame.scale.y = 1.7 + Math.sin(t * 11) * 0.12;
      const { u: U, f: F } = cfg.current; const scale = 0.55; const uS = U * scale * 0.42; const fS = F * scale * 0.42;
      candle.position.set(-uS, 0.55, 0);
      dynamic.clear();
      const objTop = new THREE.Vector3(-uS, 3.15, 0); const centre = new THREE.Vector3(0, 1.6, 0);
      const vv = (F * U) / (U - F); const vS = vv * scale * 0.42; const virtual = U < F;
      const imgH = virtual ? 1.55 * (F / (F - U)) : 1.55 * (vv / U);
      const imgTopY = virtual ? 1.6 + imgH : 1.6 - imgH; const imgX = virtual ? -vS : vS;
      // Rays: parallel then through far focal, through centre straight
      const rayMat = 0xfde68a;
      dynamic.add(line([objTop, centre, new THREE.Vector3(imgX, imgTopY, 0)], rayMat));
      const farFocal = new THREE.Vector3(fS, 1.6, 0);
      dynamic.add(line([objTop, new THREE.Vector3(0, objTop.y, 0), new THREE.Vector3(imgX, imgTopY, 0)], 0x7dd3fc));
      if (!virtual) dynamic.add(line([objTop, new THREE.Vector3(0, objTop.y, 0), farFocal], 0x7dd3fc, 0.25));
      // Focal markers
      [-fS, fS, -2 * fS, 2 * fS].forEach((x, i) => { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xfb7185 : 0x38bdf8 })); dot.position.set(x, 1.6, 0); dynamic.add(dot); });
      // Image arrow
      const col = virtual ? 0x34d399 : 0xfb7185;
      const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, Math.abs(imgTopY - 1.6), 10), new THREE.MeshBasicMaterial({ color: col })); arrow.position.set(imgX, (imgTopY + 1.6) / 2, 0); dynamic.add(arrow);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 14), new THREE.MeshBasicMaterial({ color: col })); head.position.set(imgX, imgTopY, 0); if (!virtual) head.rotation.z = Math.PI; dynamic.add(head);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: virtual ? 0.12 : 0.92 })); screen.position.set(imgX, 1.7, -0.15); dynamic.add(screen);
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint /><div className="absolute bottom-3 left-3 flex gap-2 text-xs font-bold"><span className="rounded-full bg-sky-500/70 px-2.5 py-1">F = Focal point</span><span className="rounded-full bg-rose-500/70 px-2.5 py-1">2F</span><span className="rounded-full bg-black/55 px-2.5 py-1">Yellow ray: through centre • Blue ray: parallel</span></div></div>
      <div className="space-y-4">
        <Panel title="Lens Controls"><Slider label="Object Distance (u)" value={u} min={3} max={22} unit=" cm" onChange={setU} /><Slider label="Focal Length (f)" value={f} min={4} max={10} unit=" cm" onChange={setF} /></Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Image Distance (v)" value={isVirtual ? `${Math.abs(v).toFixed(1)} cm` : `${v.toFixed(1)} cm`} sub={isVirtual ? "Same side (virtual)" : "Opposite side (real)"} />
          <Stat label="Magnification" value={`${Math.abs(mag).toFixed(2)}x`} sub={mag < 0 ? "Inverted" : "Erect"} />
          <Stat label="Image Nature" value={isVirtual ? "Virtual" : "Real"} />
          <Stat label="Size" value={Math.abs(mag) > 1.05 ? "Magnified" : Math.abs(mag) < 0.95 ? "Diminished" : "Same size"} />
        </div>
        <div className="rounded-3xl bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100/90 ring-1 ring-amber-400/20"><b>Try this:</b> Keep f = 6 cm. At u = 18 cm (beyond 2F) image is small & inverted. At u = 12 cm (at 2F) it is same size. Move inside 6 cm - the image flips virtual, erect and magnified, like a magnifying glass.</div>
      </div>
    </div>
  );
}
