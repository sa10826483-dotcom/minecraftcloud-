'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TerminalView } from '@/components/console/terminal-view';

export default function DedicatedConsolePage() {
  const params = useParams();
  const serverId = params?.id as string;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct real-time command input and output log stream for this Minecraft server instance.
        </p>
      </div>
      <TerminalView serverId={serverId} isOnline={true} />
    </div>
  );
}
