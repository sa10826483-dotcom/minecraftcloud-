'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WorldManager } from '@/components/world/world-manager';

export default function DedicatedWorldPage() {
  const params = useParams();
  const serverId = params?.id as string;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">World Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure seeds, inspect region sizes, upload custom worlds, and generate new dimensions safely.
        </p>
      </div>
      <WorldManager serverId={serverId} />
    </div>
  );
}
