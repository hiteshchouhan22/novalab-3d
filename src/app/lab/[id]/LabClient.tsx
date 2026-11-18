"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Loading = () => (<div className="grid h-[520px] place-items-center rounded-3xl bg-white/[0.03] ring-1 ring-white/10"><div className="text-center"><Loader2 className="mx-auto size-8 animate-spin text-cyan-300" /><p className="mt-3 font-semibold">Loading 3D lab...</p><p className="text-sm text-slate-400">High-quality model, optimised just for this experiment</p></div></div>);

const scenes: Record<string, any> = {
  pendulum: dynamic(() => import("@/components/experiments/Pendulum"), { ssr: false, loading: Loading }),
  projectile: dynamic(() => import("@/components/experiments/Projectile"), { ssr: false, loading: Loading }),
  "solar-system": dynamic(() => import("@/components/experiments/SolarSystem"), { ssr: false, loading: Loading }),
  molecule: dynamic(() => import("@/components/experiments/Molecule"), { ssr: false, loading: Loading }),
  optics: dynamic(() => import("@/components/experiments/Optics"), { ssr: false, loading: Loading }),
  dna: dynamic(() => import("@/components/experiments/Dna"), { ssr: false, loading: Loading }),
};

export default function LabClient({ id }: { id: string }) {
  const Scene = scenes[id];
  if (!Scene) return <p>Lab not found.</p>;
  return <Scene />;
}
