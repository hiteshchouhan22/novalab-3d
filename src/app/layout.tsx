import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", weight: ["500", "600", "700", "900"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "NovaLab 3D - Virtual Science Lab for Students",
  description: "Practice Physics and Chemistry experiments in interactive 3D. Faster, clearer and closer to the real bench than traditional virtual labs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-50 border-b border-[#1c1a15] bg-[#f5f1e8]/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-baseline gap-2">
              <FlaskConical className="size-5 translate-y-0.5 text-[#2e40e0]" />
              <span className="font-display text-[22px] font-black tracking-tight">NovaLab <span className="text-[#2e40e0]">3D</span></span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-[#57534a] md:flex">
              <Link href="/#labs" className="hover:text-[#1c1a15]">Experiments</Link>
              <Link href="/#why" className="hover:text-[#1c1a15]">Why NovaLab</Link>
              <Link href="/lab/pendulum" className="hover:text-[#1c1a15]">Start practising</Link>
            </nav>
            <Link href="/lab/pendulum" className="border border-[#1c1a15] bg-[#1c1a15] px-4 py-2 text-sm font-bold text-[#f5f1e8] transition hover:bg-[#2e40e0] hover:border-[#2e40e0]">Open the lab</Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#1c1a15] py-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end">
            <div>
              <p className="font-display text-xl font-black">NovaLab 3D</p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#57534a]">A working bench for Class 11 and 12 Physics and Chemistry. Every experiment runs live in your browser, no install, no waiting room.</p>
            </div>
            <div className="font-mono text-xs leading-relaxed text-[#57534a]">
              <p>14 experiments · Physics · Chemistry</p>
              <p>Models: procedural Three.js + Blender apparatus</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
