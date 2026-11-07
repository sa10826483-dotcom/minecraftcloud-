'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, UserPlus, Trash2, Key, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ServerMemberItem {
  id: string;
  email: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIEWER';
  addedAt: string;
}

export default function DedicatedSecurityPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const [members, setMembers] = useState<ServerMemberItem[]>([
    {
      id: 'm1',
      username: 'steve',
      email: 'owner@minecraftcloud.net',
      role: 'OWNER',
      addedAt: '2026-11-01',
    },
    {
      id: 'm2',
      username: 'admin',
      email: 'admin@minecraftcloud.net',
      role: 'ADMIN',
      addedAt: '2026-11-01',
    },
    {
      id: 'm3',
      username: 'alex_mod',
      email: 'mod@minecraftcloud.net',
      role: 'MODERATOR',
      addedAt: '2026-11-04',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MODERATOR' | 'VIEWER'>('MODERATOR');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember: ServerMemberItem = {
      id: `m-${Date.now()}`,
      username: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      addedAt: new Date().toISOString().split('T')[0],
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    alert(`Granted ${inviteRole} access to ${inviteEmail}`);
  };

  const handleRemove = (id: string, username: string) => {
    if (confirm(`Revoke server access for ${username}?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" /> Access Control & Server Roles
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Role-Based Access Control (RBAC) to delegate moderation, console access, or administration.
        </p>
      </div>

      {/* Role Definitions Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { role: 'OWNER', desc: 'Full root access, delete server, billing, member invites.' },
          { role: 'ADMIN', desc: 'Start, stop, restart, file editor, plugins, world settings.' },
          { role: 'MODERATOR', desc: 'Interactive console, player kick/ban/whitelist commands.' },
          { role: 'VIEWER', desc: 'Read-only overview metrics and live player statuses.' },
        ].map((r) => (
          <div key={r.role} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs font-bold text-emerald-400 font-mono">{r.role}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Invite Member Form */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Assign Server Member</CardTitle>
          <CardDescription>Grant sub-user permissions to manage this Minecraft server.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white sm:w-40"
            >
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <Button type="submit" variant="glow" className="gap-1.5 text-xs">
              <UserPlus className="h-4 w-4" /> Add Member
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Members List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Assigned Role</th>
              <th className="px-4 py-3">Member Since</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-white">{m.username}</td>
                <td className="px-4 py-3 font-mono text-slate-400">{m.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={m.role === 'OWNER' ? 'purple' : m.role === 'ADMIN' ? 'success' : 'default'}
                  >
                    {m.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">{m.addedAt}</td>
                <td className="px-4 py-3 text-right">
                  {m.role !== 'OWNER' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(m.id, m.username)}
                      className="h-7 px-2 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
