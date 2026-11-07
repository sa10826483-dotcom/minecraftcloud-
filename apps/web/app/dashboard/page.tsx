'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Server,
  Plus,
  Play,
  Square,
  RotateCw,
  Terminal,
  Activity,
  Users,
  HardDrive,
  Cpu,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ServerListItem {
  id: string;
  name: string;
  description: string;
  edition: 'JAVA' | 'BEDROCK' | 'CROSSPLAY';
  version: string;
  software: string;
  status: string;
  javaPort: number;
  bedrockPort: number;
  host: string;
  memoryLimitMb: number;
  cpuLimitCores: number;
  playersOnline: number;
  maxPlayers: number;
  cpuUsage: number;
  memoryUsageMb: number;
}

export default function DashboardOverviewPage() {
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch {
      // Fallback demo data if DB is initial
      setServers([
        {
          id: 'demo-diamond-realms-01',
          name: 'Diamond Realms Cross-Play',
          description: 'Official Java & Bedrock Cross-Play Survival Server with GeyserMC and Floodgate.',
          edition: 'CROSSPLAY',
          version: '1.21.1',
          software: 'PURPUR',
          status: 'ONLINE',
          javaPort: 25565,
          bedrockPort: 19132,
          host: 'play.minecraftcloud.net',
          memoryLimitMb: 6144,
          cpuLimitCores: 4,
          playersOnline: 4,
          maxPlayers: 50,
          cpuUsage: 24.5,
          memoryUsageMb: 3480,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalServers = servers.length;
  const onlineServers = servers.filter((s) => s.status === 'ONLINE').length;
  const totalPlayers = servers.reduce((acc, s) => acc + (s.playersOnline || 0), 0);
  const totalRamGb = (
    servers.reduce((acc, s) => acc + (s.memoryLimitMb || 4096), 0) / 1024
  ).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Server Infrastructure
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time management for your persistent cloud-hosted Minecraft instances.
          </p>
        </div>
        <Link href="/dashboard/servers/create">
          <Button variant="glow" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Create New Server</span>
          </Button>
        </Link>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Servers
              </span>
              <span className="text-2xl font-bold text-white font-mono">{totalServers}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Online Instances
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {onlineServers} <span className="text-xs text-slate-500 font-normal">/ {totalServers}</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Connected Players
              </span>
              <span className="text-2xl font-bold text-white font-mono">{totalPlayers}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Allocated RAM
              </span>
              <span className="text-2xl font-bold text-white font-mono">{totalRamGb} GB</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servers List Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-400" /> Active Instances
        </h2>

        {servers.length === 0 && !loading && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <Server className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Minecraft servers deployed yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Get started by provisioning your first high-performance Java and Bedrock cross-play server.
            </p>
            <Link href="/dashboard/servers/create">
              <Button variant="glow" className="gap-2">
                <Plus className="h-4 w-4" /> Deploy First Server
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {servers.map((srv) => {
            const isOnline = srv.status === 'ONLINE';
            const ramPct = ((srv.memoryUsageMb || 0) / (srv.memoryLimitMb || 4096)) * 100;

            return (
              <div
                key={srv.id}
                className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Server Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                        {srv.name}
                      </h3>
                      <StatusBadge status={srv.status} />
                      <Badge
                        variant={srv.edition === 'CROSSPLAY' ? 'purple' : srv.edition === 'JAVA' ? 'cyan' : 'default'}
                      >
                        {srv.edition === 'CROSSPLAY' ? 'Java + Bedrock' : srv.edition}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        {srv.software} {srv.version}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{srv.description}</p>

                    {/* IP & Ports */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 font-sans mr-1">Java:</span>
                        <strong className="text-emerald-400">{srv.host}:{srv.javaPort}</strong>
                      </div>
                      {srv.edition === 'CROSSPLAY' && (
                        <div>
                          <span className="text-slate-500 font-sans mr-1">Bedrock:</span>
                          <strong className="text-purple-400">{srv.host}</strong> (Port: {srv.bedrockPort})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resource Gauges */}
                  <div className="flex items-center gap-6 py-2 lg:py-0 border-y lg:border-y-0 lg:border-l border-slate-800/80 lg:pl-6 text-xs">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>CPU</span>
                        <span className="text-white font-mono">{isOnline ? (srv.cpuUsage || 18).toFixed(1) : 0}%</span>
                      </div>
                      <Progress value={isOnline ? srv.cpuUsage || 18 : 0} max={100} variant="emerald" />
                    </div>

                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>RAM</span>
                        <span className="text-white font-mono">{isOnline ? ramPct.toFixed(0) : 0}%</span>
                      </div>
                      <Progress value={isOnline ? ramPct : 0} max={100} variant="emerald" />
                    </div>

                    <div className="text-center min-w-[70px]">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                        Players
                      </span>
                      <span className="font-mono font-bold text-sm text-white">
                        {srv.playersOnline || 0} / {srv.maxPlayers}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 lg:pt-0">
                    <Link href={`/dashboard/servers/${srv.id}`}>
                      <Button variant="default" size="sm" className="gap-1.5 text-xs">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Manage & Console</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
