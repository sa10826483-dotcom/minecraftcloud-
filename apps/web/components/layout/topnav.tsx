'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Bell, Shield, Cpu } from 'lucide-react';
import { Button } from '../ui/button';

interface TopNavProps {
  onOpenMobile?: () => void;
  serverName?: string;
  serverStatus?: string;
  username?: string;
  role?: string;
}

export function TopNav({
  onOpenMobile,
  serverName,
  serverStatus,
  username = 'Player',
  role = 'OWNER',
}: TopNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: hamburger + breadcrumb / status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {serverName ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400 hidden sm:inline">Server:</span>
            <span className="font-semibold text-white tracking-wide">{serverName}</span>
            {serverStatus && (
              <span
                className={`ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  serverStatus === 'ONLINE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : serverStatus === 'CRASHED'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    serverStatus === 'ONLINE'
                      ? 'bg-emerald-400 animate-ping'
                      : serverStatus === 'CRASHED'
                      ? 'bg-red-400'
                      : 'bg-slate-400'
                  }`}
                />
                {serverStatus}
              </span>
            )}
          </div>
        ) : (
          <span className="font-semibold text-white tracking-wide text-sm sm:text-base">
            MinecraftCloud Dashboard
          </span>
        )}
      </div>

      {/* Right side: node status + notifications + user badge + logout */}
      <div className="flex items-center gap-3">
        {/* Node Health Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs text-slate-300">
          <Cpu className="h-3.5 w-3.5 text-emerald-400" />
          <span>Cloud Node 01</span>
          <span className="text-emerald-400 font-mono font-medium">99.9% Up</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">{username}</span>
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sign out"
          className="text-slate-400 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
