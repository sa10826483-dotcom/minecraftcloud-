import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variantClasses = {
      default:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 hover:shadow-emerald-600/30 border border-emerald-500/40',
      glow: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] border border-emerald-300/40',
      destructive:
        'bg-red-600/90 hover:bg-red-600 text-white shadow-md shadow-red-950/40 hover:shadow-red-600/30 border border-red-500/40',
      outline:
        'border border-slate-700/80 bg-slate-900/40 hover:bg-slate-800/80 hover:text-white text-slate-300 hover:border-slate-600',
      secondary:
        'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/50',
      ghost: 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-lg px-6 text-base',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
