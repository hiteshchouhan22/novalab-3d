import * as THREE from "three";
import { labelSprite, loadModel } from "@/lib/three-base";

export type TubeBench = {
  liquidMats: THREE.MeshPhysicalMaterial[];
  liquids: THREE.Mesh[];
  ppts: THREE.Mesh[];
  bubbles: THREE.Group;
  bubbleMeshes: THREE.Mesh[];
};

/** Shared chemistry bench: rack with 3 test tubes, reagent bottle, imported beaker. */
export function buildTubeBench(scene: THREE.Scene, tubeLabels: string[]): TubeBench {
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.6 });
  const rack = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.18, 1.1), rackMat); rack.position.y = 0.65; rack.castShadow = rack.receiveShadow = true; scene.add(rack);
  const rackTop = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 1.1), rackMat); rackTop.position.y = 1.95; scene.add(rackTop);
  [-2, 2].forEach(x => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.3, 1.0), rackMat); leg.position.set(x, 1.3, 0); scene.add(leg); });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.22, roughness: 0.05, transmission: 0.5 });
  const liquidMats: THREE.MeshPhysicalMaterial[] = []; const liquids: THREE.Mesh[] = []; const ppts: THREE.Mesh[] = [];
  tubeLabels.forEach((lab, i) => {
    const x = -1.4 + i * 1.4;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 1.9, 22, 1, true), glassMat); tube.position.set(x, 1.62, 0); scene.add(tube);
    const bot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), glassMat); bot.rotation.x = Math.PI; bot.position.set(x, 0.68, 0); scene.add(bot);
    const lm = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.55, roughness: 0.1 });
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 1.05, 18), lm); liq.position.set(x, 1.22, 0); scene.add(liq);
    liquidMats.push(lm); liquids.push(liq);
    const ppt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.3, 18), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    ppt.geometry.translate(0, 0.15, 0); ppt.position.set(x, 0.72, 0); ppt.scale.y = 0.001; scene.add(ppt); ppts.push(ppt);
    const l = labelSprite(lab, "#e2e8f0", 0.62); l.position.set(x, 2.95, 0); scene.add(l);
  });
  // Reagent bottle (white, blue cap)
  const bottle = new THREE.Group(); bottle.position.set(3.1, 0, 0.4); scene.add(bottle);
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })); bb.position.y = 0.5; bb.castShadow = true; bottle.add(bb);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })); cap.position.y = 1.1; bottle.add(cap);
  const bl = labelSprite("Reagent", "#93c5fd", 0.66); bl.position.set(3.1, 1.6, 0.4); scene.add(bl);
  loadModel("beaker", 1.05).then(m => { m.position.set(-3.2, 0, 0.5); scene.add(m); }).catch(() => {});
  // Bubbles for effervescence (positioned by the lab at the active tube)
  const bubbles = new THREE.Group(); bubbles.visible = false; scene.add(bubbles);
  const bubbleMeshes: THREE.Mesh[] = [];
  const bGeo = new THREE.SphereGeometry(0.045, 8, 6); const bMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
  for (let i = 0; i < 16; i++) { const b = new THREE.Mesh(bGeo, bMat); b.position.set((Math.random() - 0.5) * 0.3, Math.random() * 1.0, (Math.random() - 0.5) * 0.3); bubbles.add(b); bubbleMeshes.push(b); }
  return { liquidMats, liquids, ppts, bubbles, bubbleMeshes };
}
