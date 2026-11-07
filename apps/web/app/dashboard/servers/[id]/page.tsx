'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Server,
  Terminal,
  Activity,
  Users,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  Globe,
  Shield,
  Layers,
  Sparkles,
  Settings,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ServerControls } from '@/components/dashboard/server-controls';
import { ResourceMonitor, ResourceMetrics } from '@/components/dashboard/resource-monitor';
import { TerminalView } from '@/components/console/terminal-view';

export default function ServerOverviewPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [server, setServer] = useState<any>({
    id: serverId,
    name: 'Diamond Realms Cross-Play',
    description: 'Purpur 1.21.1 Cross-Play Survival with Geyser & Floodgate',
    edition: 'CROSSPLAY',
    version: '1.21.1',
    software: 'PURPUR',
    status: 'ONLINE',
    javaPort: 25565,
    bedrockPort: 19132,
    host: 'play.minecraftcloud.net',
    memoryLimitMb: 6144,
    cpuLimitCores: 4.0,
    diskLimitMb: 40960,
    maxPlayers: 50,
    crashCount: 0,
    lastCrashReason: null,
  });

  const [metrics, setMetrics] = useState<ResourceMetrics>({
    cpuPercentage: 24.5,
    memoryUsageMb: 3480.0,
    memoryLimitMb: 6144.0,
    diskUsageMb: 8420.0,
    diskLimitMb: 40960.0,
    networkRxBytes: 142800000,
    networkTxBytes: 389200000,
    tps: 19.98,
    onlinePlayers: 4,
    maxPlayers: 50,
    uptimeSeconds: 86400,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchServerData = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.server) {
          setServer(data.server);
          if (data.server.resource) {
            setMetrics({
              cpuPercentage: data.server.resource.cpuUsagePercent || 20,
              memoryUsageMb: data.server.resource.memoryUsageMb || 3000,
              memoryLimitMb: data.server.memoryLimitMb || 6144,
              diskUsageMb: data.server.resource.diskUsageMb || 8000,
              diskLimitMb: data.server.diskLimitMb || 40960,
              networkRxBytes: data.server.resource.networkRxMb * 1024 * 1024 || 0,
              networkTxBytes: data.server.resource.networkTxMb * 1024 * 1024 || 0,
              tps: data.server.resource.tps || 20.0,
              onlinePlayers: data.server.resource.onlinePlayers || 4,
              maxPlayers: data.server.maxPlayers || 50,
              uptimeSeconds: data.server.resource.uptimeSeconds || 3600,
            });
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchServerData();
    const interval = setInterval(fetchServerData, 4000);
    return () => clearInterval(interval);
  }, [serverId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isOnline = server.status === 'ONLINE';

  return (
    <div className="space-y-6">
      {/* Crash Banner (if crashed) */}
      {server.status === 'CRASHED' && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
            <div>
              <h4 className="font-bold text-red-100 text-sm">Server Process Crashed</h4>
              <p className="text-xs text-red-300 mt-0.5">
                {server.lastCrashReason || 'Exceeded maximum automatic restart retries. Check console logs for errors.'}
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => fetchServerData()}
            className="text-xs gap-1 shrink-0 bg-red-600 hover:bg-red-500"
          >
            <RotateCw className="h-3.5 w-3.5" /> Restart Server
          </Button>
        </div>
      )}

      {/* Server Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {server.name}
            </h1>
            <StatusBadge status={server.status} />
            <Badge variant="purple">Geyser Cross-Play</Badge>
            <span className="text-xs text-slate-400 font-mono">
              {server.software} {server.version}
            </span>
          </div>

          <p className="text-xs text-slate-400">{server.description}</p>

          {/* Quick Connect IP badges & Admin Pass */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => copyToClipboard('localhost:25565', 'local')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/60 text-xs font-mono text-emerald-300 hover:bg-emerald-900/60 transition-colors shadow-sm"
              title="Click to copy local address for your Minecraft game client"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>Java IP: <strong>localhost:25565</strong></span>
              {copiedKey === 'local' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-emerald-400" />}
            </button>

            <button
              onClick={() => copyToClipboard('localhost', 'bedrock')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-purple-400 hover:border-purple-500/50 transition-colors"
            >
              <Globe className="h-3 w-3 text-purple-400" />
              <span>Bedrock IP: <strong>localhost</strong> (Port: 19132)</span>
              {copiedKey === 'bedrock' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-slate-500" />}
            </button>

            <button
              onClick={() => copyToClipboard('mc-cloud-secure-rcon', 'rcon')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-500/50 text-xs font-mono text-amber-300 hover:bg-amber-900/50 transition-colors"
              title="Click to copy Admin RCON password"
            >
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Pass: <strong>mc-cloud-secure-rcon</strong></span>
              {copiedKey === 'rcon' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-amber-400" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium pt-1">
            🎮 <strong>Direct Connect:</strong> Minecraft Multiplayer me IP: <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono">localhost</code> dalein. Admin OP lene ke liye niche Console me type karein: <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-400 font-mono">op &lt;your_username&gt;</code>
          </p>
        </div>

        {/* Server Action Controls */}
        <div className="flex items-center justify-start lg:justify-end">
          <ServerControls
            serverId={server.id}
            status={server.status}
            onActionComplete={fetchServerData}
          />
        </div>
      </div>

      {/* Live Resource Telemetry Gauges */}
      <ResourceMonitor metrics={metrics} />

      {/* Live Interactive Terminal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" /> Live Terminal & Console
          </h2>
          <span className="text-xs text-slate-500 font-mono">Direct Cloud Socket Connection</span>
        </div>
        <TerminalView serverId={server.id} isOnline={isOnline} />
      </div>
    </div>
  );
}
