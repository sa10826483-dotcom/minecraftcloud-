'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PlayerManager, PlayerData } from '@/components/players/player-manager';

export default function DedicatedPlayersPage() {
  const params = useParams();
  const serverId = params?.id as string;

  const defaultPlayers: PlayerData[] = [
    {
      id: 'p1',
      username: 'AlexMiner',
      uuid: 'c06f8906-4c3e-4b2e-a579-247077a06c59',
      edition: 'JAVA',
      isOnline: true,
      isOp: true,
      isWhitelisted: true,
      isBanned: false,
      firstJoined: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    },
    {
      id: 'p2',
      username: '.XboxGamer99',
      uuid: '00000000-0000-0000-0009-01f4c7821ea9',
      edition: 'BEDROCK',
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      firstJoined: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    },
    {
      id: 'p3',
      username: 'NetherKnight',
      uuid: 'd892f390-3490-4a81-bb0a-493019840294',
      edition: 'JAVA',
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      firstJoined: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    },
    {
      id: 'p4',
      username: '.PocketCraft_MC',
      uuid: '00000000-0000-0000-0009-881bc391f1a2',
      edition: 'BEDROCK',
      isOnline: true,
      isOp: false,
      isWhitelisted: true,
      isBanned: false,
      firstJoined: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Player Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor online players, manage operator status, whitelist entries, kicks, and bans for Java and Bedrock clients.
        </p>
      </div>
      <PlayerManager serverId={serverId} initialPlayers={defaultPlayers} />
    </div>
  );
}
