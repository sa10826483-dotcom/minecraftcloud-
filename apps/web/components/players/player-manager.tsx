'use client';

import React, { useState } from 'react';
import { Users, Shield, ShieldOff, UserX, Ban, CheckCircle, Plus, Search, Radio } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog } from '../ui/dialog';

export interface PlayerData {
  id: string;
  username: string;
  uuid: string;
  edition: 'JAVA' | 'BEDROCK';
  isOnline: boolean;
  isOp: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
  banReason?: string | null;
  firstJoined: string;
  lastSeen: string;
  ipAddress?: string | null;
}

interface PlayerManagerProps {
  serverId: string;
  initialPlayers: PlayerData[];
}

export function PlayerManager({ serverId, initialPlayers }: PlayerManagerProps) {
  const [players, setPlayers] = useState<PlayerData[]>(initialPlayers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OP' | 'BANNED'>('ALL');
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    player: PlayerData | null;
    action: string;
    reason: string;
  }>({
    open: false,
    player: null,
    action: '',
    reason: '',
  });
  const [customPlayerModal, setCustomPlayerModal] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customAction, setCustomAction] = useState<'ban' | 'op' | 'whitelist' | 'kick'>('ban');
  const [customReason, setCustomReason] = useState('Banned by administrator');

  const handleCustomPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;

    const trimmed = customUsername.trim();
    let command = '';
    if (customAction === 'ban') command = `ban ${trimmed} ${customReason || 'Banned by administrator'}`;
    else if (customAction === 'kick') command = `kick ${trimmed} ${customReason || 'Kicked by administrator'}`;
    else if (customAction === 'op') command = `op ${trimmed}`;
    else if (customAction === 'whitelist') command = `whitelist add ${trimmed}`;

    try {
      const res = await fetch(`/api/servers/${serverId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (res.ok) {
        // Add or update player in list
        const existing = players.find((p) => p.username.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
          setPlayers((prev) =>
            prev.map((p) => {
              if (p.id === existing.id) {
                if (customAction === 'ban') return { ...p, isBanned: true, banReason: customReason, isOnline: false };
                if (customAction === 'op') return { ...p, isOp: true };
                if (customAction === 'whitelist') return { ...p, isWhitelisted: true };
                if (customAction === 'kick') return { ...p, isOnline: false };
              }
              return p;
            })
          );
        } else {
          const newPlayer: PlayerData = {
            id: `p-${Date.now()}`,
            username: trimmed,
            uuid: 'custom-' + Math.random().toString(36).substring(2, 10),
            edition: trimmed.startsWith('.') ? 'BEDROCK' : 'JAVA',
            isOnline: false,
            isOp: customAction === 'op',
            isWhitelisted: customAction === 'whitelist',
            isBanned: customAction === 'ban',
            banReason: customAction === 'ban' ? customReason : null,
            firstJoined: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          };
          setPlayers((prev) => [newPlayer, ...prev]);
        }
        alert(`Successfully executed /${command}!`);
        setCustomUsername('');
        setCustomPlayerModal(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to execute command');
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleAction = async (player: PlayerData, action: 'kick' | 'ban' | 'unban' | 'op' | 'deop' | 'whitelist' | 'unwhitelist', reason?: string) => {
    try {
      let command = '';
      if (action === 'kick') command = `kick ${player.username} ${reason || 'Kicked by administrator'}`;
      else if (action === 'ban') command = `ban ${player.username} ${reason || 'Banned by administrator'}`;
      else if (action === 'unban') command = `pardon ${player.username}`;
      else if (action === 'op') command = `op ${player.username}`;
      else if (action === 'deop') command = `deop ${player.username}`;
      else if (action === 'whitelist') command = `whitelist add ${player.username}`;
      else if (action === 'unwhitelist') command = `whitelist remove ${player.username}`;

      const res = await fetch(`/api/servers/${serverId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (res.ok) {
        // Optimistically update local state
        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id === player.id) {
              if (action === 'op') return { ...p, isOp: true };
              if (action === 'deop') return { ...p, isOp: false };
              if (action === 'ban') return { ...p, isBanned: true, isOnline: false, banReason: reason };
              if (action === 'unban') return { ...p, isBanned: false, banReason: null };
              if (action === 'kick') return { ...p, isOnline: false };
              if (action === 'whitelist') return { ...p, isWhitelisted: true };
              if (action === 'unwhitelist') return { ...p, isWhitelisted: false };
            }
            return p;
          })
        );
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.uuid.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'ONLINE') return p.isOnline;
    if (filter === 'OP') return p.isOp;
    if (filter === 'BANNED') return p.isBanned;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by player name or UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-slate-950/80 text-xs"
          />
        </div>

        {/* Filter Pills & Quick Ban Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ONLINE', 'OP', 'BANNED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
          <Button
            onClick={() => setCustomPlayerModal(true)}
            size="sm"
            className="bg-red-600/90 hover:bg-red-600 text-white font-medium text-xs flex items-center gap-1.5 h-8 px-3 ml-1"
          >
            <Ban className="h-3.5 w-3.5" />
            Ban / Action Player
          </Button>
        </div>
      </div>

      {/* Players Table / Cards */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Player</th>
                <th className="px-4 py-3.5">Edition</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Whitelist</th>
                <th className="px-4 py-3.5">Last Seen</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    No players found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Username & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://mc-heads.net/avatar/${player.username}/32`}
                          alt={player.username}
                          className="h-8 w-8 rounded-md bg-slate-800 border border-slate-700"
                          onError={(e) => {
                            // Fallback if avatar service is offline
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {player.username}
                            {player.isOp && (
                              <span title="Server Operator">
                                <Shield className="h-3.5 w-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                            {player.uuid}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Edition */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={player.edition === 'BEDROCK' ? 'purple' : 'cyan'}
                        className="font-mono text-[10px]"
                      >
                        {player.edition}
                      </Badge>
                    </td>

                    {/* Online Status */}
                    <td className="px-4 py-3">
                      {player.isBanned ? (
                        <Badge variant="destructive">BANNED</Badge>
                      ) : player.isOnline ? (
                        <Badge variant="success" pulse>
                          ONLINE
                        </Badge>
                      ) : (
                        <span className="text-slate-500">Offline</span>
                      )}
                    </td>

                    {/* OP Status */}
                    <td className="px-4 py-3">
                      {player.isOp ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <Shield className="h-3 w-3" /> OP
                        </span>
                      ) : (
                        <span className="text-slate-500">Member</span>
                      )}
                    </td>

                    {/* Whitelist */}
                    <td className="px-4 py-3">
                      {player.isWhitelisted ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>

                    {/* Last Seen */}
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(player.lastSeen).toLocaleDateString()}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* OP Toggle */}
                        {player.isOp ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(player, 'deop')}
                            title="De-OP Player"
                            className="h-7 px-2 text-slate-400 hover:text-amber-400"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(player, 'op')}
                            title="Make Operator"
                            className="h-7 px-2 text-slate-400 hover:text-emerald-400"
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Kick if online */}
                        {player.isOnline && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                player,
                                action: 'kick',
                                reason: 'Kicked by moderator',
                              })
                            }
                            title="Kick Player"
                            className="h-7 px-2 text-slate-400 hover:text-amber-400"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Ban / Unban */}
                        {player.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(player, 'unban')}
                            className="h-7 px-2 text-emerald-400 border-emerald-500/30"
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                player,
                                action: 'ban',
                                reason: 'Banned by administrator',
                              })
                            }
                            title="Ban Player"
                            className="h-7 px-2 text-slate-400 hover:text-red-400"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog (Kick/Ban Reason) */}
      {actionModal.open && actionModal.player && (
        <Dialog
          open={actionModal.open}
          onOpenChange={(open) => setActionModal((prev) => ({ ...prev, open }))}
          title={`${actionModal.action.toUpperCase()} Player: ${actionModal.player.username}`}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (actionModal.player) {
                    handleAction(
                      actionModal.player,
                      actionModal.action as any,
                      actionModal.reason
                    );
                  }
                  setActionModal((prev) => ({ ...prev, open: false }));
                }}
              >
                Confirm {actionModal.action.toUpperCase()}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <label className="text-xs text-slate-400 font-medium">Reason for action:</label>
            <Input
              value={actionModal.reason}
              onChange={(e) => setActionModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Griefing, unfair gameplay, foul language..."
            />
          </div>
        </Dialog>
      )}

      {/* Custom Player Action Dialog */}
      {customPlayerModal && (
        <Dialog
          open={customPlayerModal}
          onOpenChange={(open) => setCustomPlayerModal(open)}
          title="Ban or Action Any Minecraft Player"
          footer={
            <>
              <Button variant="outline" onClick={() => setCustomPlayerModal(false)}>
                Cancel
              </Button>
              <Button
                variant={customAction === 'ban' ? 'destructive' : 'default'}
                onClick={handleCustomPlayerSubmit}
              >
                Execute {customAction.toUpperCase()}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCustomPlayerSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Player Username</label>
              <Input
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g. Notch, Hacker123, or .BedrockPlayer"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Action</label>
              <select
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ban">BAN Player (/ban)</option>
                <option value="kick">KICK Player (/kick)</option>
                <option value="op">Grant Admin OP (/op)</option>
                <option value="whitelist">Add to Whitelist (/whitelist add)</option>
              </select>
            </div>
            {customAction === 'ban' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Ban Reason</label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Banned by administrator"
                />
              </div>
            )}
          </form>
        </Dialog>
      )}
    </div>
  );
}
