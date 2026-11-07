'use client';

import React from 'react';
import { Cpu, HardDrive, MemoryStick, Wifi, Users, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { formatBytes, formatUptime } from '@/lib/utils';

export interface ResourceMetrics {
  cpuPercentage: number;
  memoryUsageMb: number;
  memoryLimitMb: number;
  diskUsageMb: number;
  diskLimitMb: number;
  networkRxBytes: number;
  networkTxBytes: number;
  tps: number;
  onlinePlayers: number;
  maxPlayers: number;
  uptimeSeconds: number;
}

export function ResourceMonitor({ metrics }: { metrics: ResourceMetrics }) {
  const memoryPercent = (metrics.memoryUsageMb / metrics.memoryLimitMb) * 100;
  const diskPercent = (metrics.diskUsageMb / metrics.diskLimitMb) * 100;

  // TPS status badge color
  const tpsColor =
    metrics.tps >= 19.5
      ? 'text-emerald-400'
      : metrics.tps >= 17.0
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CPU Usage Card */}
      <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-400" /> CPU Load
            </span>
            <span className="text-white font-mono font-bold text-sm">
              {metrics.cpuPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.cpuPercentage} max={100} variant="emerald" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Allocated vCPU: 4.0</span>
            <span>Peak: {(metrics.cpuPercentage * 1.25).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage Card */}
      <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <MemoryStick className="h-4 w-4 text-emerald-400" /> RAM Usage
            </span>
            <span className="text-white font-mono font-bold text-sm">
              {(metrics.memoryUsageMb / 1024).toFixed(1)} / {(metrics.memoryLimitMb / 1024).toFixed(1)} GB
            </span>
          </div>
          <Progress value={memoryPercent} max={100} variant="emerald" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{memoryPercent.toFixed(1)}% in use</span>
            <span>Heap: JVM G1GC</span>
          </div>
        </CardContent>
      </Card>

      {/* Storage Disk Card */}
      <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-cyan-400" /> Disk Space
            </span>
            <span className="text-white font-mono font-bold text-sm">
              {(metrics.diskUsageMb / 1024).toFixed(1)} / {(metrics.diskLimitMb / 1024).toFixed(1)} GB
            </span>
          </div>
          <Progress value={diskPercent} max={100} variant="blue" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>NVMe Persistent SSD</span>
            <span>{diskPercent.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* TPS & Uptime Card */}
      <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <Zap className="h-4 w-4 text-amber-400" /> Tick Rate (TPS)
            </div>
            <div className={`font-mono font-extrabold text-base ${tpsColor}`}>
              {metrics.tps.toFixed(2)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">/ 20.0</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Players: <strong className="text-white font-mono">{metrics.onlinePlayers}</strong> / {metrics.maxPlayers}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatUptime(metrics.uptimeSeconds)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
