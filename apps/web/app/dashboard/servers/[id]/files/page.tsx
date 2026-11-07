'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FileManager } from '@/components/files/file-manager';

export default function DedicatedFilesPage() {
  const params = useParams();
  const serverId = params?.id as string;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">File Manager</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore directories, edit configurations, upload plugins, and view server files in an isolated sandboxed volume.
        </p>
      </div>
      <FileManager serverId={serverId} />
    </div>
  );
}
