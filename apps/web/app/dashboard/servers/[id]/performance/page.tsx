'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Cpu, MemoryStick, HardDrive, Wifi, Users, Zap, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function DedicatedPerformancePage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D'>('1H');

  // Simulated 24 datapoints for visual chart
  const cpuData = [12, 14, 18, 15, 22, 28, 32, 25, 20, 19, 24, 27, 30, 26, 21, 23, 29, 34, 25, 22, 24, 20, 23, 25];
  const tpsData = [20, 20, 20, 19.9, 19.8, 20, 20, 19.9, 20, 20, 20, 19.7, 19.8, 20, 20, 20, 20, 19.9, 20, 20, 20, 20, 20, 19.98];
  const memoryData = [3.1, 3.2, 3.2, 3.4, 3.5, 3.5, 3.6, 3.4, 3.3, 3.3, 3.4, 3.5, 3.6, 3.5, 3.4, 3.4, 3.5, 3.6, 3.5, 3.4, 3.4, 3.5, 3.5, 3.48];

  return (
    <div className="space-y-6">
      {/* Top Header & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" /> Historical Performance Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time profiling of CPU ticks, heap allocation, TPS latency, and network bandwidth.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
          {(['1H', '6H', '24H', '7D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeRange === r
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              CPU (Current / Peak)
            </span>
            <div className="text-xl font-bold font-mono text-white">
              24.5% <span className="text-xs text-slate-400 font-normal">/ 34.0%</span>
            </div>
            <span className="text-[11px] text-emerald-400">Average: 23.2%</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Tick Rate (TPS)
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              19.98 <span className="text-xs text-slate-400 font-normal">/ 20.0</span>
            </div>
            <span className="text-[11px] text-emerald-400">Optimal (0.02 tick drift)</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              JVM Heap RAM
            </span>
            <div className="text-xl font-bold font-mono text-white">
              3.48 GB <span className="text-xs text-slate-400 font-normal">/ 6.0 GB</span>
            </div>
            <span className="text-[11px] text-cyan-400">Peak: 3.65 GB</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Network Throughput
            </span>
            <div className="text-xl font-bold font-mono text-white">
              389 MB <span className="text-xs text-slate-400 font-normal">Out</span>
            </div>
            <span className="text-[11px] text-purple-400">142 MB In</span>
          </CardContent>
        </Card>
      </div>

      {/* Visual Historical Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" /> CPU Usage History
              </span>
              <span className="font-mono text-xs text-emerald-400">24.5%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-40 flex items-end gap-1.5 pt-4 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {cpuData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all"
                    style={{ height: `${(val / 40) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{timeRange} ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>

        {/* TPS Chart */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" /> Server TPS (Ticks Per Second)
              </span>
              <span className="font-mono text-xs text-emerald-400">19.98 / 20.0</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-40 flex items-end gap-1.5 pt-4 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {tpsData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-amber-400/80 hover:bg-amber-300 rounded-t transition-all"
                    style={{ height: `${(val / 20) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{timeRange} ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
