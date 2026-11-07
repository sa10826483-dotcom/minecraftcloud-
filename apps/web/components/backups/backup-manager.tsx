'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseBackup, Plus, Download, RotateCcw, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, ConfirmDialog } from '../ui/dialog';
import { formatBytes } from '@/lib/utils';

export interface BackupItem {
  id: string;
  name: string;
  type: 'FULL' | 'WORLD_ONLY' | 'CONFIG_ONLY';
  sizeBytes: number;
  status: 'COMPLETED' | 'CREATING' | 'FAILED';
  createdAt: string;
  checksum?: string;
}

interface BackupManagerProps {
  serverId: string;
  initialBackups?: BackupItem[];
}

export function BackupManager({ serverId, initialBackups = [] }: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [createModal, setCreateModal] = useState(false);
  const [backupType, setBackupType] = useState<'FULL' | 'WORLD_ONLY' | 'CONFIG_ONLY'>('FULL');
  const [isCreating, setIsCreating] = useState(false);
  const [restoreModal, setRestoreModal] = useState<{ open: boolean; backup: BackupItem | null }>({
    open: false,
    backup: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; backup: BackupItem | null }>({
    open: false,
    backup: null,
  });

  const loadBackups = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/backups`);
      if (res.ok) {
        const data = await res.json();
        if (data.backups) {
          setBackups(data.backups);
        }
      }
    } catch {}
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: backupType }),
      });
      if (res.ok) {
        setCreateModal(false);
        loadBackups();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to trigger backup');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreModal.backup) return;
    try {
      const res = await fetch(`/api/servers/${serverId}/backups/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: restoreModal.backup.name }),
      });
      if (res.ok) {
        alert('Server backup restored successfully! Container rebooted.');
        setRestoreModal({ open: false, backup: null });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to restore backup');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.backup) return;
    try {
      const res = await fetch(`/api/servers/${serverId}/backups?fileName=${encodeURIComponent(deleteModal.backup.name)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBackups((prev) => prev.filter((b) => b.id !== deleteModal.backup?.id));
        setDeleteModal({ open: false, backup: null });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Create Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <DatabaseBackup className="h-4 w-4 text-emerald-400" /> Server Backup Snapshots
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated and manual snapshots stored in persistent cloud NVMe storage.
          </p>
        </div>
        <Button variant="glow" size="sm" onClick={() => setCreateModal(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Create Snapshot
        </Button>
      </div>

      {/* Backups List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Snapshot Name</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                  No snapshots recorded yet. Click "Create Snapshot" to back up your world now.
                </td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={b.id || b.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2 font-mono">
                    <DatabaseBackup className="h-3.5 w-3.5 text-emerald-400" />
                    {b.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {formatBytes(Number(b.sizeBytes))}
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'COMPLETED' ? (
                      <Badge variant="success">READY</Badge>
                    ) : b.status === 'CREATING' ? (
                      <Badge variant="warning" pulse>
                        CREATING
                      </Badge>
                    ) : (
                      <Badge variant="destructive">FAILED</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRestoreModal({ open: true, backup: b })}
                        className="h-7 px-2 text-slate-400 hover:text-amber-400"
                        title="Restore this snapshot"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Direct download initiated for ${b.name}`)}
                        className="h-7 px-2 text-slate-400 hover:text-emerald-400"
                        title="Download archive"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, backup: b })}
                        className="h-7 px-2 text-slate-400 hover:text-red-400"
                        title="Delete snapshot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Backup Dialog */}
      <Dialog
        open={createModal}
        onOpenChange={setCreateModal}
        title="Create Server Snapshot"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleCreateBackup} disabled={isCreating}>
              {isCreating ? 'Archiving...' : 'Create Snapshot'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="text-xs text-slate-400 font-medium">Select Backup Type:</label>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                type: 'FULL' as const,
                title: 'Full Server Backup',
                desc: 'Entire server directory: worlds, configs, jar engines, plugins, and player data.',
              },
              {
                type: 'WORLD_ONLY' as const,
                title: 'World Only Backup',
                desc: 'Overworld, Nether, and End regions with chunk data.',
              },
              {
                type: 'CONFIG_ONLY' as const,
                title: 'Configuration Only',
                desc: 'server.properties, YAML configurations, whitelist, and player permissions.',
              },
            ].map((opt) => (
              <div
                key={opt.type}
                onClick={() => setBackupType(opt.type)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  backupType === opt.type
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-sm shadow-emerald-500/20'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-white text-xs">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Confirm Restore Dialog */}
      <ConfirmDialog
        open={restoreModal.open}
        onOpenChange={(open) => setRestoreModal((prev) => ({ ...prev, open }))}
        title={`Restore Snapshot: ${restoreModal.backup?.name}?`}
        message="Restoring this snapshot will stop the server, unpack files into the active server directory, and reboot the container. Any unsaved progress since this snapshot was created will be replaced."
        confirmLabel="RESTORE"
        variant="destructive"
        onConfirm={handleRestore}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        title={`Delete Snapshot?`}
        message={`Are you sure you want to permanently delete snapshot "${deleteModal.backup?.name}"?`}
        confirmLabel="DELETE"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
