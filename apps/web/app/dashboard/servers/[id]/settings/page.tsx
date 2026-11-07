'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, Save, ShieldAlert, Sliders, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DedicatedSettingsPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [motd, setMotd] = useState('§6§lMinecraftCloud §r§8» §aDiamond Realms §7[1.21.1] §eJava + Bedrock');
  const [difficulty, setDifficulty] = useState('hard');
  const [gamemode, setGamemode] = useState('survival');
  const [pvp, setPvp] = useState(true);
  const [allowFlight, setAllowFlight] = useState(false);
  const [onlineMode, setOnlineMode] = useState(true);
  const [viewDistance, setViewDistance] = useState(12);
  const [simulationDistance, setSimulationDistance] = useState(8);
  const [spawnProtection, setSpawnProtection] = useState(16);

  const [autoRestart, setAutoRestart] = useState(true);
  const [maxCrashRetries, setMaxCrashRetries] = useState(3);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motd,
          difficulty,
          gamemode,
          pvp,
          allowFlight,
          onlineMode,
          viewDistance,
          simulationDistance,
          spawnProtection,
          autoRestart,
          maxCrashRetries,
        }),
      });
      if (res.ok) {
        alert('Server properties saved! Restart server to apply changes to server.properties.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update settings');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-400" /> Server Properties & Policy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Directly configure Minecraft's server.properties and automatic crash recovery policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">General Server Settings</CardTitle>
            <CardDescription>Server MOTD, game modes, and world distances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Message of the Day (MOTD)</label>
              <Input
                value={motd}
                onChange={(e) => setMotd(e.target.value)}
                placeholder="Minecraft server message"
              />
              <span className="text-[11px] text-slate-500">Supports Minecraft color formatting codes with §</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-xs font-medium text-slate-300">Default Game Mode</label>
                <select
                  value={gamemode}
                  onChange={(e) => setGamemode(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value="survival">Survival</option>
                  <option value="creative">Creative</option>
                  <option value="adventure">Adventure</option>
                  <option value="spectator">Spectator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">View Distance (Chunks)</label>
                <Input
                  type="number"
                  value={viewDistance}
                  onChange={(e) => setViewDistance(parseInt(e.target.value, 10))}
                  min={4}
                  max={32}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Simulation Distance (Chunks)</label>
                <Input
                  type="number"
                  value={simulationDistance}
                  onChange={(e) => setSimulationDistance(parseInt(e.target.value, 10))}
                  min={3}
                  max={32}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineMode}
                  onChange={(e) => setOnlineMode(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Online Mode</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pvp}
                  onChange={(e) => setPvp(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Enable PvP</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFlight}
                  onChange={(e) => setAllowFlight(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Allow Flight</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Crash Recovery Policy */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" /> Automatic Crash Recovery Policy
            </CardTitle>
            <CardDescription>
              Protect against server downtime with intelligent crash detection and reboot loops prevention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Auto-Restart on Crash</label>
                <select
                  value={autoRestart ? 'true' : 'false'}
                  onChange={(e) => setAutoRestart(e.target.value === 'true')}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white"
                >
                  <option value="true">Enabled (Auto-detect & restart)</option>
                  <option value="false">Disabled (Leave container stopped)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Max Crash Retries Before Halt</label>
                <Input
                  type="number"
                  value={maxCrashRetries}
                  onChange={(e) => setMaxCrashRetries(parseInt(e.target.value, 10))}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="glow" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
