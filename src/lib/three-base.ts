import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  dispose: () => void;
  setAnimation: (fn: (t: number, dt: number) => void) => void;
};

export function createStage(container: HTMLElement, opts?: { bg?: number; camPos?: [number, number, number]; target?: [number, number, number] }): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts?.bg ?? 0x070b18);
  scene.fog = new THREE.Fog(opts?.bg ?? 0x070b18, 30, 90);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
  const cp = opts?.camPos ?? [6, 4, 8];
  camera.position.set(cp[0], cp[1], cp[2]);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxDistance = 40;
  controls.minDistance = 2;
  const tg = opts?.target ?? [0, 1, 0];
  controls.target.set(tg[0], tg[1], tg[2]);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(6, 10, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 10; key.shadow.camera.bottom = -10;
  scene.add(key);
  const rim = new THREE.PointLight(0x22d3ee, 18, 30);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  let raf = 0;
  let animFn: ((t: number, dt: number) => void) | null = null;
  const clock = new THREE.Clock();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (animFn) animFn(t, dt);
    controls.update();
    renderer.render(scene, camera);
  };
  loop();

  const onResize = () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  return {
    renderer, scene, camera, controls,
    setAnimation: (fn) => { animFn = fn; },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o: any) => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: any) => { m.map?.dispose?.(); m.dispose?.(); }); });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}

export function floor(scene: THREE.Scene, size = 30, color = 0x0f172a) {
  const g = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 48), new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
  const grid = new THREE.GridHelper(size, 30, 0x334155, 0x1e293b);
  (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = 0.01; scene.add(grid);
  return g;
}

export function labelSprite(text: string, color = "#ffffff", scale = 1) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 80;
  const ctx = c.getContext("2d")!; ctx.font = "bold 36px Inter, Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = 8; ctx.fillStyle = color; ctx.fillText(text, 128, 40);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(1.6 * scale, 0.5 * scale, 1);
  return sp;
}
