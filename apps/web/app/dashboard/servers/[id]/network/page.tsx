'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { NetworkConfig } from '@/components/network/network-config';

export default function DedicatedNetworkPage() {
  const params = useParams();
  const serverId = params?.id as string;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Network & Domains</h1>
        <p className="text-xs text-slate-400 mt-1">
          Java and Bedrock cross-play addresses, ports, and custom domain DNS configuration records.
        </p>
      </div>
      <NetworkConfig
        host="play.minecraftcloud.net"
        javaPort={25565}
        bedrockPort={19132}
        edition="CROSSPLAY"
      />
    </div>
  );
}
