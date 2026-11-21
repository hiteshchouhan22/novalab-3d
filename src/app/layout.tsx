import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FlaskConical, Zap, BookOpen, Trophy } from "lucide-react";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NovaLab 3D - Virtual Science Lab for Students",
  description: "Practice Physics, Chemistry and Biology experiments in stunning interactive 3D. Faster, clearer and more beautiful than traditional virtual labs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#05070f]">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070f]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan-400 shadow-lg shadow-cyan-500/20"><FlaskConical className="size-5 text-white" /></span>
              <span className="text-lg font-black tracking-tight">NovaLab <span className="text-cyan-300">3D</span></span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm font-medium text-slate-300 md:flex">
              <Link href="/#labs" className="rounded-full px-4 py-2 hover:bg-white/5 hover:text-white">Experiments</Link>
              <Link href="/#why" className="rounded-full px-4 py-2 hover:bg-white/5 hover:text-white">Why NovaLab</Link>
              <Link href="/lab/pendulum" className="rounded-full px-4 py-2 hover:bg-white/5 hover:text-white">Start Practising</Link>
            </nav>
            <Link href="/lab/pendulum" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-cyan-300 transition"><Zap className="size-4" /> Open Lab</Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
            <p className="flex items-center gap-2"><BookOpen className="size-4" /> NovaLab 3D - Learn by doing, in 3D.</p>
            <p className="flex items-center gap-2"><Trophy className="size-4" /> Aligned to Class 9-12 Physics, Chemistry & Biology</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
