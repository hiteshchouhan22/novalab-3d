# NovaLab 3D — Virtual Science Lab for Students

A next-generation alternative to OLabs, built with **Next.js + Three.js**. Students practise Physics, Chemistry and Biology experiments in high-quality interactive 3D — with live calculations, real apparatus-style controls, theory and procedure for every lab.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Three.js](https://img.shields.io/badge/Three.js-0.187-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Run in GitHub Codespaces (1 click)

Click **Code → Codespaces → Create codespace on main**. The devcontainer auto-installs dependencies and starts the dev server on port 3000. Open the forwarded port to view the site.

Locally:

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # production build
```

## 🧪 Experiments (6)

| Lab | Subject | What you do |
|---|---|---|
| Simple Pendulum | Physics | Change length & planet gravity, live SHM graph, measured vs theory period |
| Projectile Motion | Physics | Cannon with angle/speed, trajectory trace, target challenge |
| Solar System & Orbits | Physics | All 8 planets, time speed, click-to-focus, Saturn rings, Earth's Moon |
| Molecule Builder | Chemistry | H₂O, CO₂, CH₄, NH₃ in true ball-and-stick 3D, VSEPR shapes & bond angles |
| Lens & Light Rays | Physics | Move candle, change focal length, real rays form real/virtual image live |
| DNA Double Helix | Biology | A-T / G-C base pairs in colour, unwind slider like replication |

## ⚡ Performance (why it's fast)

- **Zero Three.js on the homepage** — 3D is `next/dynamic` + `ssr:false`, code-split **per experiment**, so a lab loads only its own scene chunk.
- Procedural models only — **no external GLTF/texture downloads**, nothing to wait on.
- Renderer capped at `devicePixelRatio ≤ 2`, 1024px shadow maps, reused geometries/materials, proper disposal on unmount.
- Static generation for all lab pages (`generateStaticParams`), optimised fonts (`next/font`, `display:swap`), `optimizePackageImports` for `three` / `lucide-react`.
- ACES tone mapping + PCF soft shadows for quality without post-processing cost.

## 🎨 Model & UI quality

Every model is built in code with PBR / physical materials (brass pendulum bob with clearcoat, glass lens with transmission, emissive Sun with glow, flame-lit candle), soft shadows and cinematic lighting — no low-poly placeholders. UI is a dark glass design system with subject-wise gradients, search + subject filters, and a consistent lab workspace: 3D viewport + controls + live stats + Aim / Theory / Procedure.

## 📁 Structure

```
src/
  app/            # App Router pages (home is a Server Component)
    lab/[id]/     # Static lab pages + client scene loader
  components/
    experiments/  # One self-contained Three.js scene per lab
    LabExplorer.tsx, ui.tsx
  lib/
    labs.ts       # Lab catalogue, theory, procedure data
    three-base.ts # Shared optimised renderer / stage / lights
.devcontainer/    # Codespaces: auto npm install + dev server on 3000
```
