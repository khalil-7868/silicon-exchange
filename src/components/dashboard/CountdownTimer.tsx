'use client';

import React, { useState, useEffect } from 'react';
import { formatCountdown } from '@/lib/formatters';
import { HOLD_EXPIRY_MS } from '@/lib/reservations';
import { ClockIcon } from '@/components/ui/Icons';

interface CountdownTimerProps {
  createdAt: number;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({
  createdAt,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const [msRemaining, setMsRemaining] = useState<number>(() => {
    const elapsed = Date.now() - createdAt;
    return Math.max(0, HOLD_EXPIRY_MS - elapsed);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - createdAt;
      const rem = Math.max(0, HOLD_EXPIRY_MS - elapsed);
      setMsRemaining(rem);

      if (rem <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  const isCritical = msRemaining < 2 * 60 * 1000; // < 2 minutes

  if (msRemaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-800/40 border border-slate-700/40">
        <ClockIcon size={12} />
        <span>EXPIRED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider transition-colors border ${
        isCritical
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      } ${className}`}
    >
      <ClockIcon size={13} className={isCritical ? 'text-rose-400' : 'text-amber-400'} />
      <span>HOLD EXPIRES: {formatCountdown(msRemaining)}</span>
    </span>
  );
}
