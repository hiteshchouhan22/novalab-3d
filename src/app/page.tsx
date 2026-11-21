import Link from "next/link";
import LabExplorer from "@/components/LabExplorer";
import PendulumPlate from "@/components/PendulumPlate";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="graph-paper grid gap-10 border-b border-[#1c1a15] py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <h1 className="font-display max-w-xl text-[42px] font-black leading-[1.02] tracking-tight sm:text-6xl">Practice experiments like you are <span className="text-[#2e40e0]">actually in the lab</span></h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#57534a]">Fourteen Physics and Chemistry experiments for Classes 11 and 12, each one a working 3D bench with live readings, not a video of someone else's practical.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lab/pendulum" className="border border-[#1c1a15] bg-[#1c1a15] px-6 py-3.5 font-bold text-[#f5f1e8] transition hover:bg-[#2e40e0] hover:border-[#2e40e0]">Start with the pendulum</Link>
            <Link href="#labs" className="border border-[#1c1a15] px-6 py-3.5 font-bold transition hover:bg-[#1c1a15] hover:text-[#f5f1e8]">Browse the index</Link>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-[#d9d2c0] pt-5 font-mono">
            <div><dt className="text-xs text-[#57534a]">Experiments</dt><dd className="mt-1 text-2xl font-semibold">14</dd></div>
            <div><dt className="text-xs text-[#57534a]">Classes</dt><dd className="mt-1 text-2xl font-semibold">11–12</dd></div>
            <div><dt className="text-xs text-[#57534a]">Cost</dt><dd className="mt-1 text-2xl font-semibold">Free</dd></div>
          </dl>
        </div>
        <PendulumPlate />
      </section>

      <section id="labs" className="scroll-mt-24 py-12">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-black sm:text-4xl">The experiment index</h2>
          <p className="font-mono text-xs text-[#57534a]">numbered as in the lab record book</p>
        </div>
        <LabExplorer />
      </section>

      <section id="why" className="scroll-mt-24 border-t border-[#1c1a15] py-12 pb-16">
        <h2 className="font-display max-w-2xl text-3xl font-black sm:text-4xl">Why this bench, and not the old virtual labs</h2>
        <div className="mt-8">
          {[
            ["01", "It loads like a page, not a project", "3D is code-split per experiment, so the index opens instantly and each bench arrives only when you open it. The old sims made you wait 15 to 20 seconds for a plugin to wake up."],
            ["02", "You turn the knobs yourself", "Drag, rotate, change values and watch the physics answer back. A pendulum you can lengthen teaches more than a video of a pendulum."],
            ["03", "The numbers are computed, not printed", "Periods, currents, focal lengths, titres and pH are calculated live from your readings and checked against theory, the way a lab record is marked."],
            ["04", "It runs on the phone in your pocket", "Capped pixel ratio and light geometry keep every bench smooth on modest hardware, because that is what most students actually have."],
          ].map(([n, t, d]) => (
            <div key={n} className="grid gap-2 border-t border-[#d9d2c0] py-6 sm:grid-cols-[64px_280px_1fr] sm:gap-6">
              <span className="font-mono text-sm font-semibold text-[#2e40e0]">{n}</span>
              <h3 className="font-display text-xl font-bold leading-snug">{t}</h3>
              <p className="max-w-xl leading-relaxed text-[#57534a]">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 border-l-2 border-[#2e40e0] bg-[#efe9dc] px-5 py-4">
          <p className="leading-relaxed"><span className="font-bold">On quality.</span> <span className="text-[#57534a]">Models are built procedurally with PBR materials, soft shadows and ACES tone mapping, and the chemistry benches use real Blender apparatus models. No low-poly placeholders.</span></p>
        </div>
      </section>
    </div>
  );
}
