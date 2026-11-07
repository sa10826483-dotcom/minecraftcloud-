'use client';

import React, { useState } from 'react';
import { Network, Copy, Check, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface NetworkConfigProps {
  host?: string;
  javaPort?: number;
  bedrockPort?: number;
  edition?: 'JAVA' | 'BEDROCK' | 'CROSSPLAY';
}

export function NetworkConfig({
  host = 'play.minecraftcloud.net',
  javaPort = 25565,
  bedrockPort = 19132,
  edition = 'CROSSPLAY',
}: NetworkConfigProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Connection Endpoint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Java Edition Endpoint */}
        <Card className="border-slate-800 bg-slate-900/60 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" /> Minecraft Java Edition
              </CardTitle>
              <Badge variant="cyan">PC / Mac / Linux</Badge>
            </div>
            <CardDescription className="text-xs">
              Direct connection address for Minecraft Java Edition clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Server Address</span>
                <span className="text-white font-bold">{host}:{javaPort}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`${host}:${javaPort}`, 'java')}
                className="h-8 gap-1 text-xs"
              >
                {copiedKey === 'java' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'java' ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block font-sans">Protocol</span>
                <span>TCP / IPv4</span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block font-sans">Default Port</span>
                <span>{javaPort}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bedrock Edition Endpoint */}
        <Card className="border-slate-800 bg-slate-900/60 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400" /> Minecraft Bedrock Edition
              </CardTitle>
              <Badge variant="purple">GeyserMC Cross-Play</Badge>
            </div>
            <CardDescription className="text-xs">
              For iOS, Android, Windows 10/11, Xbox, PlayStation, and Switch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Bedrock Host & Port</span>
                <span className="text-white font-bold">{host}</span>
                <span className="text-emerald-400 ml-2 font-semibold">Port: {bedrockPort}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(host, 'bedrock')}
                className="h-8 gap-1 text-xs"
              >
                {copiedKey === 'bedrock' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'bedrock' ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block font-sans">Protocol</span>
                <span>UDP / RakNet</span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-500 block font-sans">Bedrock Port</span>
                <span>{bedrockPort}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DNS Configuration Guide */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-400" /> Custom Domain DNS Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Connect your custom domain (e.g., play.yourdomain.com) to this Minecraft server using Cloudflare or your DNS registrar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-sans uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Record Type</th>
                  <th className="p-2.5">Name / Host</th>
                  <th className="p-2.5">Target / Value</th>
                  <th className="p-2.5">Port / Priority</th>
                  <th className="p-2.5">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2.5 text-emerald-400 font-bold font-sans">A Record</td>
                  <td className="p-2.5">play</td>
                  <td className="p-2.5">149.28.102.40</td>
                  <td className="p-2.5 text-slate-500">-</td>
                  <td className="p-2.5 text-slate-500">Auto / 300s</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-cyan-400 font-bold font-sans">SRV (Java)</td>
                  <td className="p-2.5">_minecraft._tcp.play</td>
                  <td className="p-2.5">play.yourdomain.com</td>
                  <td className="p-2.5">Priority: 0, Port: {javaPort}</td>
                  <td className="p-2.5 text-slate-500">Auto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
