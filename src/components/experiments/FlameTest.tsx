"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, floor, labelSprite, loadModel } from "@/lib/three-base";
import { Panel, Stat, ViewportHint } from "@/components/ui";

const IONS = [
  { name: "Sodium (Na⁺)", color: 0xffc400, css: "#ffc400", label: "Golden Yellow", wavelength: "589 nm" },
  { name: "Potassium (K⁺)", color: 0xce93d8, css: "#ce93d8", label: "Lilac", wavelength: "766 nm" },
  { name: "Calcium (Ca²⁺)", color: 0xff5722, css: "#ff5722", label: "Brick Red", wavelength: "622 nm" },
  { name: "Barium (Ba²⁺)", color: 0x69f0ae, css: "#69f0ae", label: "Apple Green", wavelength: "554 nm" },
  { name: "Strontium (Sr²⁺)", color: 0xd50000, css: "#d50000", label: "Crimson Red", wavelength: "661 nm" },
];

export default function FlameTest() {
  const mount = useRef<HTMLDivElement>(null);
  const cfg = useRef({ color: 0x42a5f5, target: new THREE.Color(0x42a5f5) });
  const [sel, setSel] = useState(-1);
  const ion = sel >= 0 ? IONS[sel] : null;
  useEffect(() => { cfg.current.target = new THREE.Color(sel >= 0 ? IONS[sel].color : 0x42a5f5); }, [sel]);

  useEffect(() => {
    if (!mount.current) return;
    const stage = createStage(mount.current, { bg: 0x0a0a12, camPos: [0, 3.2, 7.6], target: [0, 1.5, 0] });
    const { scene } = stage; scene.fog = null; floor(scene, 20, 0x111827);
    loadModel("burner", 1.15).then(m => { m.position.set(0, 0, 0); scene.add(m); }).catch(() => {});
    loadModel("spatula", 1.5).then(m => { m.rotation.z = Math.PI / 2.2; m.position.set(2.6, 0.1, 1.2); scene.add(m); }).catch(() => {});
    // Flame: two nested cones, colour lerps to the ion colour
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.85 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.5, 24), flameMat); flame.position.set(0, 1.85, 0); scene.add(flame);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xbbdefb, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 18), coreMat); core.position.set(0, 1.5, 0); scene.add(core);
    const glow = new THREE.PointLight(0x42a5f5, 12, 9); glow.position.set(0, 2, 0); scene.add(glow);
    // Nichrome wire with loop, dipped toward the flame
    const wire = new THREE.Group(); scene.add(wire);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0xd6d3d1, metalness: 0.9, roughness: 0.3 })); rod.rotation.z = Math.PI / 2.6; rod.position.set(1.15, 2.6, 0); wire.add(rod);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 24), rod.material); loop.position.set(0.18, 2.05, 0); wire.add(loop);
    const wl = labelSprite("Nichrome wire", "#e7e5e4", 0.66); wl.position.set(1.7, 3.2, 0); scene.add(wl);
    // Salt dishes in an arc
    IONS.forEach((io, i) => {
      const a = -0.9 + i * 0.45; const x = Math.sin(a) * 3.4, z = Math.cos(a) * 2.2 - 0.6;
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.16, 22), new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.4 })); dish.position.set(x, 0.08, z); dish.castShadow = true; scene.add(dish);
      const powder = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 22), new THREE.MeshStandardMaterial({ color: io.color, roughness: 1 })); powder.position.set(x, 0.17, z); scene.add(powder);
      const l = labelSprite(io.name.split(" ")[0], "#e2e8f0", 0.6); l.position.set(x, 0.62, z); scene.add(l);
    });
    stage.setAnimation((t) => {
      flameMat.color.lerp(cfg.current.target, 0.06);
      glow.color.copy(flameMat.color);
      coreMat.color.copy(flameMat.color).lerp(new THREE.Color(0xffffff), 0.45);
      flame.scale.y = 1 + Math.sin(t * 11) * 0.05; flame.scale.x = flame.scale.z = 1 + Math.sin(t * 13) * 0.03;
      wire.position.y = Math.sin(t * 0.8) * 0.05;
    });
    return () => stage.dispose();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl ring-1 ring-white/10"><div ref={mount} className="absolute inset-0" /><ViewportHint />
        <div className="absolute right-3 top-3 rounded-full px-4 py-2 font-bold backdrop-blur transition-colors" style={{ background: ion ? `${ion.css}55` : "rgba(0,0,0,.55)" }}>{ion ? `Flame: ${ion.label}` : "Flame: plain blue (no salt)"}</div>
      </div>
      <div className="space-y-4">
        <Panel title="Metal Salts - dip the wire & heat">
          <div className="grid grid-cols-1 gap-1.5">{IONS.map((io, i) => <button key={io.name} onClick={() => setSel(i)} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${sel === i ? "text-slate-900" : "bg-white/5 hover:bg-white/10"}`} style={sel === i ? { background: io.css } : {}}><span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: io.css }} />{io.name}<span className="float-right text-xs font-medium opacity-75">{io.label}</span></button>)}</div>
          {sel >= 0 && <button onClick={() => setSel(-1)} className="w-full rounded-xl bg-white/5 py-2 text-sm font-semibold">Clean wire (back to blue flame)</button>}
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Flame Colour" value={ion ? ion.label : "Blue"} sub={ion ? ion.name : "Bunsen flame alone"} />
          <Stat label="Main Wavelength" value={ion ? ion.wavelength : "-"} sub="Emission line" />
        </div>
        <div className="rounded-3xl bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100/90 ring-1 ring-amber-400/20"><b>Why colours?</b> Heat pushes the metal's electrons to higher energy levels. When they fall back, the extra energy leaves as light of one exact colour - a fingerprint for that metal. Sodium's yellow is so strong it can hide potassium's lilac, so K⁺ is viewed through cobalt-blue glass in the real lab.</div>
      </div>
    </div>
  );
}
