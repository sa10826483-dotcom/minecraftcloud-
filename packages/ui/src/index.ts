import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const themeColors = {
  emeraldGlow: '0 0 20px -3px rgba(16, 185, 129, 0.35)',
  darkCard: '#0b1322',
  background: '#050811',
};
