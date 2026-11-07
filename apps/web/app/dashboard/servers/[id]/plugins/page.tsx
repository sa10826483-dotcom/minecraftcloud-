'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PluginManager, PluginItem } from '@/components/plugins/plugin-manager';

export default function DedicatedPluginsPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const defaultPlugins: PluginItem[] = [
    {
      id: 'pl-1',
      name: 'Geyser-Spigot',
      version: '2.4.2-SNAPSHOT',
      fileName: 'Geyser-Spigot.jar',
      source: 'GEYSERMC',
      isEnabled: true,
      description: 'Enables Minecraft Bedrock Edition clients to join Minecraft Java Edition servers.',
      author: 'GeyserMC Team',
    },
    {
      id: 'pl-2',
      name: 'Floodgate',
      version: '2.2.3-SNAPSHOT',
      fileName: 'floodgate-spigot.jar',
      source: 'GEYSERMC',
      isEnabled: true,
      description: 'Hybrid authentication and skin system for Bedrock players connecting through Geyser.',
      author: 'GeyserMC Team',
    },
    {
      id: 'pl-3',
      name: 'EssentialsX',
      version: '2.20.1',
      fileName: 'EssentialsX-2.20.1.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'Core essential commands, player kits, economy, and chat formatting.',
      author: 'EssentialsX Team',
    },
    {
      id: 'pl-4',
      name: 'LuckPerms',
      version: '5.4.102',
      fileName: 'LuckPerms-Bukkit-5.4.102.jar',
      source: 'SPIGOT',
      isEnabled: true,
      description: 'Advanced permissions plugin supporting groups, prefixes, and per-world permissions.',
      author: 'Luck',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Plugin Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Install, toggle, and manage Spigot, Paper, and Purpur plugins directly from the cloud repository.
        </p>
      </div>
      <PluginManager serverId={serverId} software="PURPUR" initialPlugins={defaultPlugins} />
    </div>
  );
}
