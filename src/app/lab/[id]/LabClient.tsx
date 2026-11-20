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
  "ohms-law": dynamic(() => import("@/components/experiments/OhmsLaw"), { ssr: false, loading: Loading }),
  "hookes-law": dynamic(() => import("@/components/experiments/HookesLaw"), { ssr: false, loading: Loading }),
  prism: dynamic(() => import("@/components/experiments/Prism"), { ssr: false, loading: Loading }),
  titration: dynamic(() => import("@/components/experiments/Titration"), { ssr: false, loading: Loading }),
  "ph-lab": dynamic(() => import("@/components/experiments/PhLab"), { ssr: false, loading: Loading }),
  "flame-test": dynamic(() => import("@/components/experiments/FlameTest"), { ssr: false, loading: Loading }),
  "salt-analysis": dynamic(() => import("@/components/experiments/SaltAnalysis"), { ssr: false, loading: Loading }),
  "organic-tests": dynamic(() => import("@/components/experiments/OrganicTests"), { ssr: false, loading: Loading }),
};

export default function LabClient({ id }: { id: string }) {
  const Scene = scenes[id];
  if (!Scene) return <p>Lab not found.</p>;
  return <Scene />;
}
