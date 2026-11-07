'use client';

import React, { useState } from 'react';
import { Boxes, Plus, Search, Trash2, Power, Download, Check, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

export interface PluginItem {
  id: string;
  name: string;
  version: string;
  fileName: string;
  source: string;
  isEnabled: boolean;
  description?: string | null;
  author?: string | null;
}

interface PluginManagerProps {
  serverId: string;
  software: string;
  initialPlugins?: PluginItem[];
}

export function PluginManager({ serverId, software, initialPlugins = [] }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<PluginItem[]>(initialPlugins);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'INSTALLED' | 'CATALOG'>('INSTALLED');

  // Curated Spigot/Paper/Hangar plugin marketplace
  const curatedCatalog = [
    {
      name: 'Geyser-Spigot',
      version: '2.4.2',
      author: 'GeyserMC',
      desc: 'Enables Bedrock Edition players on iOS, Android, Xbox, PlayStation, and Switch to join Java servers.',
      source: 'GEYSERMC',
      recommended: true,
    },
    {
      name: 'Floodgate',
      version: '2.2.3',
      author: 'GeyserMC',
      desc: 'Skin and UUID hybrid auth mapping without requiring a second Java account.',
      source: 'GEYSERMC',
      recommended: true,
    },
    {
      name: 'ViaVersion',
      version: '5.0.3',
      author: 'ViaVersion Team',
      desc: 'Allows newer client versions to connect to older server versions.',
      source: 'SPIGOT',
      recommended: true,
    },
    {
      name: 'ViaBackwards',
      version: '5.0.3',
      author: 'ViaVersion Team',
      desc: 'Allows older client versions to connect to newer server versions.',
      source: 'SPIGOT',
      recommended: true,
    },
    {
      name: 'EssentialsX',
      version: '2.20.1',
      author: 'EssentialsX',
      desc: 'Complete suite of commands: /spawn, /home, /tp, kits, economy, and chat formatting.',
      source: 'SPIGOT',
      recommended: false,
    },
    {
      name: 'LuckPerms',
      version: '5.4.102',
      author: 'Luck',
      desc: 'Industry standard permission management plugin with web editor and fast SQL storage.',
      source: 'SPIGOT',
      recommended: true,
    },
    {
      name: 'CoreProtect',
      version: '22.4',
      author: 'Intelli',
      desc: 'Anti-griefing block inspection and instant rollback tool for servers.',
      source: 'SPIGOT',
      recommended: false,
    },
    {
      name: 'WorldEdit',
      version: '7.3.0',
      author: 'EngineHub',
      desc: 'In-game voxel world editor to create, replace, and terraform blocks in seconds.',
      source: 'SPIGOT',
      recommended: false,
    },
  ];

  const handleToggle = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const handleInstall = (catalogItem: typeof curatedCatalog[0]) => {
    const newPlugin: PluginItem = {
      id: `pl-${Date.now()}`,
      name: catalogItem.name,
      version: catalogItem.version,
      fileName: `${catalogItem.name}-${catalogItem.version}.jar`,
      source: catalogItem.source,
      isEnabled: true,
      description: catalogItem.desc,
      author: catalogItem.author,
    };
    setPlugins((prev) => [...prev, newPlugin]);
    alert(`Installed ${catalogItem.name} v${catalogItem.version}! Restart server to activate.`);
    setTab('INSTALLED');
  };

  const handleUninstall = (id: string, name: string) => {
    if (confirm(`Remove plugin ${name}?`)) {
      setPlugins((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('INSTALLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'INSTALLED'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setTab('CATALOG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'CATALOG'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Plugin Store & Catalog
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-slate-950/80 text-xs"
          />
        </div>
      </div>

      {/* Installed Plugins Tab */}
      {tab === 'INSTALLED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlugins.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-slate-500 italic bg-slate-900/40 rounded-xl border border-slate-800">
              No plugins installed yet. Visit the Plugin Store tab to browse and install plugins.
            </div>
          ) : (
            filteredPlugins.map((plugin) => (
              <Card
                key={plugin.id}
                className={`border-slate-800 transition-all ${
                  plugin.isEnabled ? 'bg-slate-900/60' : 'bg-slate-950/40 opacity-60'
                }`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-emerald-400" />
                      <span className="font-semibold text-white">{plugin.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">v{plugin.version}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(plugin.id)}
                        className={`h-7 px-2 ${plugin.isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}
                        title={plugin.isEnabled ? 'Disable plugin' : 'Enable plugin'}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUninstall(plugin.id, plugin.name)}
                        className="h-7 px-2 text-slate-500 hover:text-red-400"
                        title="Uninstall plugin"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{plugin.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>Source: {plugin.source}</span>
                    <span>By {plugin.author || 'Community'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Catalog Tab */}
      {tab === 'CATALOG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curatedCatalog.map((cat) => {
            const isInstalled = plugins.some((p) => p.name === cat.name);
            return (
              <Card key={cat.name} className="border-slate-800 bg-slate-900/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{cat.name}</span>
                        {cat.recommended && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Essential
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">By {cat.author} • v{cat.version}</span>
                    </div>
                    {isInstalled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Check className="h-3.5 w-3.5" /> Installed
                      </span>
                    ) : (
                      <Button
                        variant="glow"
                        size="sm"
                        onClick={() => handleInstall(cat)}
                        className="h-8 text-xs gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Install
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{cat.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
