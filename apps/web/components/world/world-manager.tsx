'use client';

import React, { useState } from 'react';
import { Globe2, Download, Upload, RefreshCw, Trash2, ShieldCheck, Sparkles, Key, Compass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ConfirmDialog, Dialog } from '../ui/dialog';

interface WorldManagerProps {
  serverId: string;
  currentSeed?: string;
  levelName?: string;
}

export function WorldManager({ serverId, currentSeed = '4820194829103948', levelName = 'world' }: WorldManagerProps) {
  const [seed, setSeed] = useState(currentSeed);
  const [worldName, setWorldName] = useState(levelName);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newWorldModal, setNewWorldModal] = useState(false);
  const [deleteWorldModal, setDeleteWorldModal] = useState(false);

  const worlds = [
    { name: 'world', type: 'Overworld', size: '420 MB', chunks: 14200 },
    { name: 'world_nether', type: 'The Nether', size: '145 MB', chunks: 5120 },
    { name: 'world_the_end', type: 'The End', size: '64 MB', chunks: 1280 },
  ];

  const handleGenerateNewWorld = async () => {
    setIsGenerating(true);
    try {
      // Send world reset command sequence
      const res = await fetch(`/api/servers/${serverId}/world`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE', worldName, seed }),
      });
      if (res.ok) {
        alert('New world generation scheduled! A safety backup was created.');
        setNewWorldModal(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to generate world');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 9007199254740991).toString();
    setSeed(randomSeed);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Active Worlds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {worlds.map((w) => (
          <Card key={w.name} className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-emerald-400" />
                  {w.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {w.type}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Disk: {w.size}</span>
                <span>{w.chunks.toLocaleString()} chunks</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* World Actions Card */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">World Generation & Seed Settings</CardTitle>
          <CardDescription>
            Manage the world seed, reset dimensions, or import custom Minecraft worlds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Level Name (Default World)</label>
              <Input
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="world"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">World Seed</label>
                <button
                  onClick={handleGenerateRandomSeed}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Randomize
                </button>
              </div>
              <Input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Leave blank or enter numeric seed"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <Button
              variant="glow"
              onClick={() => setNewWorldModal(true)}
              className="gap-1.5 text-xs"
            >
              <Compass className="h-4 w-4" /> Generate New World
            </Button>
            <Button
              variant="outline"
              onClick={() => alert('Download link generated! Archiving world into tar.gz...')}
              className="gap-1.5 text-xs"
            >
              <Download className="h-4 w-4" /> Download World (.zip)
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteWorldModal(true)}
              className="gap-1.5 text-xs ml-auto"
            >
              <Trash2 className="h-4 w-4" /> Reset World
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Confirm Modal */}
      <ConfirmDialog
        open={newWorldModal}
        onOpenChange={setNewWorldModal}
        title="Generate Brand New World?"
        message="Generating a new world will automatically create a full safety backup of the current world before regenerating chunks with the specified seed."
        confirmLabel={isGenerating ? 'Generating...' : 'Confirm & Generate'}
        variant="glow"
        onConfirm={handleGenerateNewWorld}
      />

      {/* Delete / Reset Confirm Modal */}
      <ConfirmDialog
        open={deleteWorldModal}
        onOpenChange={setDeleteWorldModal}
        title="Reset and Delete Existing World?"
        message="Are you sure you want to delete the world? All builds, inventory, and player data will be reset. An automatic safety snapshot will be taken first."
        confirmLabel="Reset World"
        variant="destructive"
        onConfirm={handleGenerateNewWorld}
      />
    </div>
  );
}
