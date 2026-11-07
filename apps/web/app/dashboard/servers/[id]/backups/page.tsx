'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BackupManager } from '@/components/backups/backup-manager';

export default function DedicatedBackupsPage() {
  const params = useParams();
  const serverId = params?.id as string;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Automated & Manual Backups</h1>
        <p className="text-xs text-slate-400 mt-1">
          Create point-in-time full server, world-only, or configuration archives with one-click restore.
        </p>
      </div>
      <BackupManager
        serverId={serverId}
        initialBackups={[
          {
            id: 'bk-1',
            name: 'backup-full-2026-11-07T12-00-00.tar.gz',
            type: 'FULL',
            sizeBytes: 842918400,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    </div>
  );
}
