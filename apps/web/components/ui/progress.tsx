import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'emerald' | 'amber' | 'red' | 'blue';
}

export function Progress({ value, max = 100, variant = 'emerald', className, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors = {
    emerald: 'bg-emerald-500 shadow-emerald-500/40',
    amber: 'bg-amber-500 shadow-amber-500/40',
    red: 'bg-red-500 shadow-red-500/40',
    blue: 'bg-blue-500 shadow-blue-500/40',
  };

  // Auto switch color if value is high
  const autoColor =
    variant === 'emerald'
      ? percentage > 90
        ? variantColors.red
        : percentage > 75
        ? variantColors.amber
        : variantColors.emerald
      : variantColors[variant];

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-300 shadow-sm', autoColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
