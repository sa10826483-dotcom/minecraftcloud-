'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Server,
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  AlertTriangle,
  UserX,
  RotateCw,
  Square,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';

export default function GlobalAdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 142,
    activeServers: 48,
    totalRamAllocatedGb: 288,
    totalStorageAllocatedGb: 1920,
    nodeCpuAvg: 34.2,
    nodeRamAvg: 58.7,
    mrrRevenue: 1420.0,
  });

  const [users, setUsers] = useState([
    {
      id: 'u1',
      username: 'steve',
      email: 'owner@minecraftcloud.net',
      serversCount: 2,
      role: 'OWNER',
      isSuspended: false,
    },
    {
      id: 'u2',
      username: 'griefer_99',
      email: 'suspect@gmail.com',
      serversCount: 1,
      role: 'VIEWER',
      isSuspended: true,
    },
    {
      id: 'u3',
      username: 'diamond_miner',
      email: 'miner@diamond.net',
      serversCount: 4,
      role: 'OWNER',
      isSuspended: false,
    },
  ]);

  const handleToggleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
    );
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Permanently delete user ${name} and all their cloud servers?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="h-7 w-7 text-amber-400" /> Global Platform Administration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cluster health monitoring, tenant resource governance, and global server orchestration.
        </p>
      </div>

      {/* Cluster Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Tenants
              </span>
              <span className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Managed Servers
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {stats.activeServers}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cluster Host RAM
              </span>
              <span className="text-2xl font-bold text-purple-400 font-mono">
                {stats.totalRamAllocatedGb} GB
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MemoryStick className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Platform MRR
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                ${stats.mrrRevenue.toFixed(0)}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cloud Nodes & Daemon Health */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" /> Cloud Compute Nodes & Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between font-sans">
                <strong className="text-white">Node 01 (US-East)</strong>
                <Badge variant="success" pulse>ACTIVE</Badge>
              </div>
              <div className="text-slate-400">Daemon: MinecraftCloud Agent v1.0.0</div>
              <div className="text-slate-400">Docker Engine: 27.3.1 (API 1.47)</div>
              <div className="text-slate-400">Containers: 24 active / 0 dead</div>
              <div className="text-emerald-400 font-bold">Node Latency: 12ms</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between font-sans">
                <strong className="text-white">Node 02 (EU-Central)</strong>
                <Badge variant="success" pulse>ACTIVE</Badge>
              </div>
              <div className="text-slate-400">Daemon: MinecraftCloud Agent v1.0.0</div>
              <div className="text-slate-400">Docker Engine: 27.3.1 (API 1.47)</div>
              <div className="text-slate-400">Containers: 18 active / 0 dead</div>
              <div className="text-emerald-400 font-bold">Node Latency: 28ms</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between font-sans">
                <strong className="text-white">Node 03 (AP-East)</strong>
                <Badge variant="success" pulse>ACTIVE</Badge>
              </div>
              <div className="text-slate-400">Daemon: MinecraftCloud Agent v1.0.0</div>
              <div className="text-slate-400">Docker Engine: 27.3.1 (API 1.47)</div>
              <div className="text-slate-400">Containers: 6 active / 0 dead</div>
              <div className="text-emerald-400 font-bold">Node Latency: 64ms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Tenant Management Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" /> Tenant Governance & Quotas
        </h2>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Server Count</th>
                <th className="px-4 py-3">Global Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{u.username}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 font-mono">{u.serversCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'OWNER' ? 'purple' : 'default'}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <Badge variant="destructive">SUSPENDED</Badge>
                    ) : (
                      <Badge variant="success">ACTIVE</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSuspend(u.id)}
                        className={`h-7 px-2 text-xs ${u.isSuspended ? 'text-emerald-400' : 'text-amber-400'}`}
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="h-7 px-2"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
