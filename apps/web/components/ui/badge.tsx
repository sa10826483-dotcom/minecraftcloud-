import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'purple' | 'cyan';
  pulse?: boolean;
}

function Badge({ className, variant = 'default', pulse = false, children, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/20',
    destructive: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-sm shadow-red-500/20',
    outline: 'text-slate-300 border-slate-700 bg-transparent',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'success'
                ? 'bg-emerald-400'
                : variant === 'destructive'
                ? 'bg-red-400'
                : 'bg-amber-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'success'
                ? 'bg-emerald-500'
                : variant === 'destructive'
                ? 'bg-red-500'
                : 'bg-amber-500'
            )}
          />
        </span>
      )}
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
      return (
        <Badge variant="success" pulse>
          ONLINE
        </Badge>
      );
    case 'OFFLINE':
      return <Badge variant="default">OFFLINE</Badge>;
    case 'STARTING':
      return (
        <Badge variant="warning" pulse>
          STARTING
        </Badge>
      );
    case 'STOPPING':
      return (
        <Badge variant="warning" pulse>
          STOPPING
        </Badge>
      );
    case 'CRASHED':
      return (
        <Badge variant="destructive" pulse>
          CRASHED
        </Badge>
      );
    case 'PROVISIONING':
      return (
        <Badge variant="cyan" pulse>
          PROVISIONING
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export { Badge };
