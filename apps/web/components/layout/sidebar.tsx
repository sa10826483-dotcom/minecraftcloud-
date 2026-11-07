'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Server,
  PlusCircle,
  Terminal,
  Users,
  FolderTree,
  Globe2,
  DatabaseBackup,
  Boxes,
  Puzzle,
  Settings,
  Network,
  Activity,
  FileText,
  CalendarClock,
  ShieldCheck,
  CreditCard,
  UserCircle,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  serverId?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ serverId: propServerId, isOpenMobile, onCloseMobile, isAdmin = true }: SidebarProps) {
  const pathname = usePathname();

  // Automatically detect active server ID from URL if inside a server view
  const match = pathname?.match(/\/dashboard\/servers\/([^\/]+)/);
  const serverId = propServerId || (match && match[1] !== 'create' ? match[1] : undefined);

  const generalNav = [
    { label: 'Overview', href: '/dashboard', icon: Layers },
    { label: 'Servers', href: '/dashboard/servers', icon: Server },
    { label: 'Create Server', href: '/dashboard/servers/create', icon: PlusCircle, highlight: true },
  ];

  const serverManagementNav = serverId
    ? [
        { label: 'Console', href: `/dashboard/servers/${serverId}/console`, icon: Terminal },
        { label: 'Players', href: `/dashboard/servers/${serverId}/players`, icon: Users },
        { label: 'Files', href: `/dashboard/servers/${serverId}/files`, icon: FolderTree },
        { label: 'World', href: `/dashboard/servers/${serverId}/world`, icon: Globe2 },
        { label: 'Backups', href: `/dashboard/servers/${serverId}/backups`, icon: DatabaseBackup },
        { label: 'Plugins', href: `/dashboard/servers/${serverId}/plugins`, icon: Boxes },
        { label: 'Mods', href: `/dashboard/servers/${serverId}/mods`, icon: Puzzle },
        { label: 'Schedules', href: `/dashboard/servers/${serverId}/schedules`, icon: CalendarClock },
        { label: 'Network', href: `/dashboard/servers/${serverId}/network`, icon: Network },
        { label: 'Performance', href: `/dashboard/servers/${serverId}/performance`, icon: Activity },
        { label: 'Logs', href: `/dashboard/servers/${serverId}/logs`, icon: FileText },
        { label: 'Settings', href: `/dashboard/servers/${serverId}/settings`, icon: Settings },
        { label: 'Security', href: `/dashboard/servers/${serverId}/security`, icon: ShieldCheck },
      ]
    : [];

  const footerNav = [
    { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { label: 'Account', href: '/dashboard/account', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/30 text-slate-950 font-black">
            MC
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-wide text-base flex items-center gap-1.5">
              Minecraft<span className="text-emerald-400">Cloud</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              24/7 Cloud Hosting
            </span>
          </div>
        </div>

        {/* Scrollable Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* General Section */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Platform
            </div>
            <nav className="space-y-1">
              {generalNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold shadow-sm shadow-emerald-500/10'
                        : item.highlight
                        ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active ? 'text-emerald-400' : 'text-slate-400')} />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Active Server Controls */}
          {serverManagementNav.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-emerald-400/90 uppercase flex items-center justify-between">
                <span>Server Tools</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <nav className="space-y-1">
                {serverManagementNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', active ? 'text-emerald-400' : 'text-slate-400')} />
                      <span>{item.label}</span>
                      {active && <ChevronRight className="ml-auto h-4 w-4 text-emerald-400" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Admin Section if Admin */}
          {isAdmin && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-amber-500/80 uppercase">
                Administration
              </div>
              <nav className="space-y-1">
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                  )}
                >
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Admin Panel</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950">
          {footerNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                )}
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
