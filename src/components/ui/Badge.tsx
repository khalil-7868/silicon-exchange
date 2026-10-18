import React from 'react';
import { ListingStatus } from '@/types/listing';
import { ReservationStatus } from '@/types/reservation';

interface BadgeProps {
  status: ListingStatus | ReservationStatus | string;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'sm', className = '', showDot = true }: BadgeProps) {
  let colorClasses = 'border-slate-500/30 bg-slate-500/10 text-slate-400';
  let dotColor = 'bg-slate-400';
  let label = status.toUpperCase();

  switch (status) {
    case 'available':
      colorClasses = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 dark:text-emerald-400';
      dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      label = 'ONLINE // READY';
      break;
    case 'maintenance':
      colorClasses = 'border-amber-500/40 bg-amber-500/10 text-amber-500 dark:text-amber-400';
      dotColor = 'bg-amber-400 animate-pulse';
      label = 'MAINTENANCE';
      break;
    case 'retired':
      colorClasses = 'border-zinc-500/30 bg-zinc-500/10 text-zinc-500';
      dotColor = 'bg-zinc-500';
      label = 'DECOMMISSIONED';
      break;
    case 'confirmed':
      colorClasses = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 dark:text-cyan-300';
      dotColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]';
      label = 'CONFIRMED';
      break;
    case 'held':
      colorClasses = 'border-amber-500/40 bg-amber-500/10 text-amber-400';
      dotColor = 'bg-amber-400 animate-ping';
      label = 'HELD (EXPIRING)';
      break;
    case 'cancelled':
      colorClasses = 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      dotColor = 'bg-rose-400';
      label = 'CANCELLED';
      break;
    case 'expired':
      colorClasses = 'border-slate-600/40 bg-slate-800/40 text-slate-500';
      dotColor = 'bg-slate-500';
      label = 'HOLD EXPIRED';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border tracking-wider uppercase transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
}
