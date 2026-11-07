'use client';

import React from 'react';
import Link from 'next/link';
import {
  Server,
  Zap,
  ShieldCheck,
  Globe2,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  Database,
  Lock,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30">
            MC
          </div>
          <span className="text-lg font-bold tracking-wide text-white">
            Minecraft<span className="text-emerald-400">Cloud</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="glow" size="sm" className="text-xs gap-1.5">
              <span>Launch Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 grid-background">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold shadow-md shadow-emerald-950/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Java + Bedrock Cross-Play Cloud Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Enterprise Minecraft Hosting <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Engineered for 24/7 Resilience
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Provision dedicated Docker-isolated Minecraft servers running Purpur, Paper, and GeyserMC.
            Persistent cloud infrastructure that never sleeps, with automated crash recovery and real-time console streaming.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/dashboard/servers/create">
              <Button variant="glow" size="lg" className="gap-2 text-sm">
                <span>Deploy Server in 60s</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-sm border-slate-700 bg-slate-900/60">
                Live Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Architecture Proof Callout */}
          <div className="pt-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-3 rounded-2xl border border-slate-800 bg-slate-900/50 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-purple-400" />
                <span>GeyserMC + Floodgate Built-In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>Isolated Docker NVMe Containers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Zero Serverless Timeout Halts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Seamless Cross-Play</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Java Edition on PC and Bedrock Edition on Xbox, PlayStation, Switch, iOS, and Android
              play together on the exact same world with automatic Floodgate skin and UUID translation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">24/7 Self-Healing Node Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Servers run on persistent cloud VMs with intelligent crash detection, automatic reboot policies,
              and scheduled cron backups independent of Vercel frontend deployments.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Real-Time Console & RCON</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Low-latency interactive web terminal with command history, instant log search, sandboxed file manager,
              and strict path traversal guards.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 MinecraftCloud Platform. Built for high-availability game hosting.</p>
      </footer>
    </div>
  );
}
