'use client';

import React from 'react';
import Link from 'next/link';
import { Reservation } from '@/types/reservation';
import { StatusBadge } from '@/components/ui/Badge';
import { CountdownTimer } from './CountdownTimer';
import { useReservationStore } from '@/store/useReservationStore';
import { formatCents, formatDateTime, formatDuration } from '@/lib/formatters';
import { CheckIcon, XIcon, ArrowRightIcon, GpuIcon } from '@/components/ui/Icons';

interface ReservationItemProps {
  reservation: Reservation;
}

export function ReservationItem({ reservation }: ReservationItemProps) {
  const { confirmReservation, cancelReservation, expireReservation } = useReservationStore();

  const isHeld = reservation.status === 'held';
  const isConfirmed = reservation.status === 'confirmed';

  const handleConfirm = () => {
    confirmReservation(reservation.id);
  };

  const handleCancel = () => {
    cancelReservation(reservation.id);
  };

  const handleExpire = () => {
    expireReservation(reservation.id);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/20 space-y-4">
      {/* Top line: Status, Timer, & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={reservation.status} size="md" />

          {isHeld && (
            <CountdownTimer
              createdAt={reservation.createdAt}
              onExpire={handleExpire}
            />
          )}

          <span className="text-[10px] font-mono text-slate-500">
            ID: {reservation.id.slice(0, 16)}...
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isHeld && (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <CheckIcon size={14} />
              <span>CONFIRM BOOKING</span>
            </button>
          )}

          {(isHeld || isConfirmed) && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-medium tracking-wider transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              <XIcon size={14} />
              <span>{isHeld ? 'RELEASE' : 'CANCEL'}</span>
            </button>
          )}

          <Link
            href={`/listings/${reservation.listingSlug}`}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Inspect Node Spec"
          >
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      {/* Main Reservation Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-white/5 font-mono text-xs">
        {/* Node Name */}
        <div className="sm:col-span-2 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Accelerator Node</div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
            <GpuIcon size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="truncate">{reservation.listingName}</span>
          </div>
          {reservation.clientNotes && (
            <div className="text-[11px] text-slate-400 italic">
              &quot;{reservation.clientNotes}&quot;
            </div>
          )}
        </div>

        {/* Time Window */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Scheduled Window</div>
          <div className="text-slate-900 dark:text-slate-200 font-medium">
            {formatDateTime(reservation.startTime)}
          </div>
          <div className="text-slate-500 text-[11px]">
            to {formatDateTime(reservation.endTime)}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
            {formatDuration(reservation.priceQuote.rawDurationMinutes)} ({reservation.priceQuote.billableHours}h billed)
          </div>
        </div>

        {/* Cost */}
        <div className="space-y-1 sm:text-right">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Quoted</div>
          <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">
            {formatCents(reservation.priceQuote.totalCostCents)}
          </div>
          {reservation.priceQuote.hasDiscount && (
            <div className="text-[10px] text-emerald-500">
              Saved {formatCents(reservation.priceQuote.discountCents)} (10% &gt;24h)
            </div>
          )}
          <div className="text-[10px] text-slate-500">
            {formatCents(reservation.priceQuote.hourlyRateCents)}/hr
          </div>
        </div>
      </div>
    </div>
  );
}
