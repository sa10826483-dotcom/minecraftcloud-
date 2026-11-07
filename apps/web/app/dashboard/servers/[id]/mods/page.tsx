'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Puzzle, Upload, Trash2, Power, AlertCircle, CheckCircle2, FileUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ModItem {
  id: string;
  name: string;
  version: string;
  fileName: string;
  loader: 'FABRIC' | 'FORGE';
  isEnabled: boolean;
  description: string;
}

export default function DedicatedModsPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [mods, setMods] = useState<ModItem[]>([
    {
      id: 'm1',
      name: 'Lithium',
      version: '0.12.7',
      fileName: 'lithium-fabric-mc1.21.1-0.12.7.jar',
      loader: 'FABRIC',
      isEnabled: true,
      description: 'General-purpose optimization mod improving game physics, mob AI, and chunk loading.',
    },
    {
      id: 'm2',
      name: 'FerriteCore',
      version: '7.0.0',
      fileName: 'ferritecore-7.0.0-fabric.jar',
      loader: 'FABRIC',
      isEnabled: true,
      description: 'Reduces memory usage of Minecraft significantly using memory optimizations.',
    },
  ]);

  const [search, setSearch] = useState('');

  const handleToggle = (id: string) => {
    setMods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove mod ${name}?`)) {
      setMods((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMods = mods.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fabric & Forge Mods</h1>
          <p className="text-xs text-slate-400 mt-1">
            Install and manage server-side modification jars with dependency resolution.
          </p>
        </div>
        <Button variant="glow" size="sm" onClick={() => alert('Drag & drop your .jar file to upload.')} className="gap-1.5 text-xs">
          <Upload className="h-4 w-4" /> Upload Mod (.jar)
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <Input
          placeholder="Filter installed mods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md h-9 bg-slate-950/80 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMods.map((mod) => (
          <Card
            key={mod.id}
            className={`border-slate-800 transition-all ${
              mod.isEnabled ? 'bg-slate-900/60' : 'bg-slate-950/40 opacity-60'
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-white">{mod.name}</span>
                  <Badge variant="purple" className="text-[10px]">{mod.loader}</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(mod.id)}
                    className={`h-7 px-2 ${mod.isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}
                    title={mod.isEnabled ? 'Disable mod' : 'Enable mod'}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(mod.id, mod.name)}
                    className="h-7 px-2 text-slate-500 hover:text-red-400"
                    title="Remove mod"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-400">{mod.description}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                {mod.fileName}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
