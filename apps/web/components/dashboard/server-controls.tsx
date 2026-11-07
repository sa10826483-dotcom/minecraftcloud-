'use client';

import React, { useState } from 'react';
import { Play, Square, RotateCw, AlertOctagon, Wrench, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/dialog';

interface ServerControlsProps {
  serverId: string;
  status: string;
  onActionComplete?: () => void;
  disabled?: boolean;
}

export function ServerControls({ serverId, status, onActionComplete, disabled }: ServerControlsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: string;
    variant: 'destructive' | 'default' | 'glow';
  }>({
    open: false,
    title: '',
    message: '',
    action: '',
    variant: 'destructive',
  });

  const isOnline = status === 'ONLINE';
  const isStarting = status === 'STARTING';
  const isStopping = status === 'STOPPING';
  const isCrashed = status === 'CRASHED';

  const executeControlAction = async (action: string) => {
    setLoadingAction(action);
    try {
      const res = await fetch(`/api/servers/${serverId}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Failed to ${action} server`);
      }
      onActionComplete?.();
    } catch (err: any) {
      alert(`Error executing ${action}: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const promptConfirmation = (action: string, title: string, message: string, variant: 'destructive' | 'glow' = 'destructive') => {
    setConfirmModal({
      open: true,
      title,
      message,
      action,
      variant,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* START */}
      {!isOnline && (
        <Button
          variant="glow"
          size="sm"
          disabled={disabled || isStarting || isStopping || loadingAction !== null}
          onClick={() => executeControlAction('start')}
          className="gap-1.5"
        >
          {loadingAction === 'start' || isStarting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-slate-950" />
          )}
          <span>START</span>
        </Button>
      )}

      {/* RESTART */}
      {isOnline && (
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || isStopping || loadingAction !== null}
          onClick={() =>
            promptConfirmation(
              'restart',
              'Restart Minecraft Server?',
              'This will gracefully save worlds, notify connected players, and reboot the container.'
            )
          }
          className="gap-1.5 hover:border-emerald-500/50"
        >
          {loadingAction === 'restart' ? (
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <RotateCw className="h-4 w-4 text-emerald-400" />
          )}
          <span>RESTART</span>
        </Button>
      )}

      {/* STOP */}
      {isOnline && (
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isStopping || loadingAction !== null}
          onClick={() =>
            promptConfirmation(
              'stop',
              'Stop Minecraft Server?',
              'This will broadcast a shutdown warning to players, save all world chunks to disk, and shut down the container safely.'
            )
          }
          className="gap-1.5 text-amber-400 hover:text-amber-300 hover:border-amber-500/40"
        >
          {loadingAction === 'stop' || isStopping ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4 fill-amber-400 text-amber-400" />
          )}
          <span>STOP</span>
        </Button>
      )}

      {/* KILL (Emergency) */}
      <Button
        variant="destructive"
        size="sm"
        disabled={disabled || loadingAction !== null}
        onClick={() =>
          promptConfirmation(
            'kill',
            'Force Kill Server Process?',
            'WARNING: Emergency kill sends SIGKILL immediately. Unsaved chunk changes may be lost. Use only if server is completely unresponsive.'
          )
        }
        className="gap-1.5"
      >
        <AlertOctagon className="h-4 w-4" />
        <span>KILL</span>
      </Button>

      {/* REBUILD */}
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loadingAction !== null}
        onClick={() =>
          promptConfirmation(
            'rebuild',
            'Rebuild Container Instance?',
            'This recreates the container with current CPU/RAM limits and environment variables while preserving all world and plugin files in persistent volumes.',
            'glow'
          )
        }
        className="gap-1.5 text-slate-300"
      >
        <Wrench className="h-4 w-4" />
        <span>REBUILD</span>
      </Button>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.action.toUpperCase()}
        onConfirm={() => executeControlAction(confirmModal.action)}
      />
    </div>
  );
}
