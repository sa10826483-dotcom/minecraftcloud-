'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Server,
  Layers,
  Cpu,
  MemoryStick,
  HardDrive,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MinecraftCompatibilityChecker } from '@/lib/minecraft-compat';

export default function CreateServerPage() {
  const router = useRouter();

  // Wizard Form State
  const [name, setName] = useState('Diamond Survival Realms');
  const [description, setDescription] = useState('High-performance Java & Bedrock Cross-Play Server');
  const [edition, setEdition] = useState<'CROSSPLAY' | 'JAVA' | 'BEDROCK'>('CROSSPLAY');
  const [version, setVersion] = useState('1.21.1');
  const [software, setSoftware] = useState<'PURPUR' | 'PAPER' | 'VANILLA' | 'FABRIC' | 'FORGE' | 'BEDROCK'>('PURPUR');

  // Specs
  const [memoryLimitMb, setMemoryLimitMb] = useState(6144);
  const [cpuLimitCores, setCpuLimitCores] = useState(4);
  const [diskLimitMb, setDiskLimitMb] = useState(40960);
  const [maxPlayers, setMaxPlayers] = useState(40);

  // Gameplay Settings
  const [difficulty, setDifficulty] = useState('normal');
  const [gameMode, setGameMode] = useState('survival');
  const [onlineMode, setOnlineMode] = useState(true);
  const [pvp, setPvp] = useState(true);
  const [allowFlight, setAllowFlight] = useState(false);
  const [whitelist, setWhitelist] = useState(false);
  const [viewDistance, setViewDistance] = useState(12);
  const [simulationDistance, setSimulationDistance] = useState(8);

  // Status transitions: IDLE -> PROVISIONING -> READY
  const [provisionState, setProvisionState] = useState<'IDLE' | 'PROVISIONING' | 'READY'>('IDLE');
  const [createdServerId, setCreatedServerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check version compatibility
  const compat = MinecraftCompatibilityChecker.check(edition, version, software);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionState('PROVISIONING');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          edition,
          version,
          software,
          memoryLimitMb,
          cpuLimitCores,
          diskLimitMb,
          maxPlayers,
          difficulty,
          gameMode,
          onlineMode,
          pvp,
          allowFlight,
          whitelist,
          viewDistance,
          simulationDistance,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server provisioning failed');
      }

      setCreatedServerId(data.server.id);

      // Simulate container initialization sequence
      setTimeout(() => {
        setProvisionState('READY');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setProvisionState('IDLE');
    }
  };

  if (provisionState === 'PROVISIONING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Loader2 className="h-8 w-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Server is being provisioned...
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Allocating persistent NVMe container volume, configuring OpenJDK 21 runtime, setting up
            GeyserMC and Floodgate hybrid authentication bridges.
          </p>
        </div>
      </div>
    );
  }

  if (provisionState === 'READY') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-wide">Server Ready!</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your Minecraft server has been provisioned successfully and is ready to launch.
          </p>
        </div>
        <Button
          variant="glow"
          size="lg"
          onClick={() => router.push(`/dashboard/servers/${createdServerId}`)}
          className="gap-2"
        >
          <span>Go to Server Console</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Server className="h-6 w-6 text-emerald-400" /> Create New Minecraft Server
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deploy an isolated, 24/7 persistent cloud Minecraft server instance with full Bedrock cross-play support.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Identity & Edition */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">1. Server Identity & Edition</CardTitle>
            <CardDescription>Name your server and choose whether to enable Java + Bedrock cross-play.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Server Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Edition Cards */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Minecraft Edition</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'CROSSPLAY' as const,
                    title: 'Java + Bedrock Cross-Play',
                    desc: 'GeyserMC + Floodgate auto-configured. Both Java & mobile/console can join!',
                    badge: 'Recommended',
                  },
                  {
                    id: 'JAVA' as const,
                    title: 'Java Edition Only',
                    desc: 'Traditional PC/Mac/Linux server with Spigot/Paper/Fabric/Forge.',
                  },
                  {
                    id: 'BEDROCK' as const,
                    title: 'Native Bedrock Dedicated',
                    desc: 'Official Mojang Bedrock Dedicated Server software.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEdition(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      edition === item.id
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{item.title}</span>
                      {item.badge && <Badge variant="success" className="text-[9px]">{item.badge}</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Software and Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Server Software Engine</label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PURPUR">Purpur (Fastest, High TPS, Geyser-ready)</option>
                  <option value="PAPER">Paper (Highly optimized, Spigot compatible)</option>
                  <option value="VANILLA">Vanilla (Official Mojang)</option>
                  <option value="FABRIC">Fabric (Lightweight mod loader)</option>
                  <option value="FORGE">Forge (Heavy modpacks)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Minecraft Version</label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="1.21.1">1.21.1 (Latest Stable, Java 21)</option>
                  <option value="1.21.0">1.21.0</option>
                  <option value="1.20.6">1.20.6</option>
                  <option value="1.20.4">1.20.4 (Recommended for Mods)</option>
                  <option value="1.20.1">1.20.1</option>
                  <option value="1.19.4">1.19.4</option>
                  <option value="1.16.5">1.16.5 (Legacy)</option>
                </select>
              </div>
            </div>

            {/* Compatibility Summary */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Version Compatibility Check
                </span>
                <span className={`font-semibold ${compat.compatible ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {compat.compatible ? 'Fully Compatible' : 'Configuration Notice'}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] space-y-1">
                <div>Supported Java Clients: <strong className="text-slate-200">{compat.supportedJavaClients.join(', ')}</strong></div>
                {compat.supportedBedrockClients.length > 0 && (
                  <div>Supported Bedrock Clients: <strong className="text-purple-300">{compat.supportedBedrockClients.join(', ')}</strong></div>
                )}
                {compat.warnings.map((w, i) => (
                  <div key={i} className="text-amber-400">• {w}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Cloud Hardware Limits */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">2. Resource Allocations</CardTitle>
            <CardDescription>Configure dedicated CPU cores, RAM, and NVMe disk quotas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <MemoryStick className="h-3.5 w-3.5 text-emerald-400" /> RAM Memory
                </label>
                <select
                  value={memoryLimitMb}
                  onChange={(e) => setMemoryLimitMb(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value={2048}>2 GB (Small)</option>
                  <option value={4096}>4 GB (Standard)</option>
                  <option value={6144}>6 GB (Recommended for Cross-play)</option>
                  <option value={8192}>8 GB (High Performance)</option>
                  <option value={16384}>16 GB (Heavy Modpacks)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" /> Dedicated vCPU
                </label>
                <select
                  value={cpuLimitCores}
                  onChange={(e) => setCpuLimitCores(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value={1}>1 vCPU Core</option>
                  <option value={2}>2 vCPU Cores</option>
                  <option value={4}>4 vCPU Cores (Optimal)</option>
                  <option value={8}>8 vCPU Cores</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-cyan-400" /> NVMe Storage
                </label>
                <select
                  value={diskLimitMb}
                  onChange={(e) => setDiskLimitMb(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value={20480}>20 GB SSD</option>
                  <option value={40960}>40 GB SSD</option>
                  <option value={81920}>80 GB SSD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> Max Players
                </label>
                <Input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                  min={1}
                  max={500}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: World & Gameplay Settings */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">3. Gameplay & Server Rules</CardTitle>
            <CardDescription>Initial world properties and access policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value="peaceful">Peaceful</option>
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Game Mode</label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value="survival">Survival</option>
                  <option value="creative">Creative</option>
                  <option value="adventure">Adventure</option>
                  <option value="spectator">Spectator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">View Distance</label>
                <Input
                  type="number"
                  value={viewDistance}
                  onChange={(e) => setViewDistance(parseInt(e.target.value, 10))}
                  min={4}
                  max={32}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Simulation Distance</label>
                <Input
                  type="number"
                  value={simulationDistance}
                  onChange={(e) => setSimulationDistance(parseInt(e.target.value, 10))}
                  min={3}
                  max={32}
                />
              </div>
            </div>

            {/* Checkbox toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineMode}
                  onChange={(e) => setOnlineMode(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Mojang Online Mode</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pvp}
                  onChange={(e) => setPvp(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Enable PvP</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFlight}
                  onChange={(e) => setAllowFlight(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Allow Flight</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whitelist}
                  onChange={(e) => setWhitelist(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Enforce Whitelist</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Deploy Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" size="lg" className="gap-2">
            <span>Provision Server Instance</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
