'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReservationStore } from '@/store/useReservationStore';
import { SpendingSummary } from '@/components/dashboard/SpendingSummary';
import { ReservationItem } from '@/components/dashboard/ReservationItem';
import { ReservationStatus } from '@/types/reservation';
import { ServerRackIcon, ArrowRightIcon, ClockIcon } from '@/components/ui/Icons';

import { useMounted } from '@/lib/useMounted';

export default function DashboardPage() {
  const { getUserReservations, checkAndExpireHolds } = useReservationStore();
  const mounted = useMounted();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ReservationStatus>('all');

  useEffect(() => {
    checkAndExpireHolds();
  }, [checkAndExpireHolds]);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center font-mono text-xs text-slate-500">
        Loading compute sessions from local store...
      </div>
    );
  }

  const userReservations = getUserReservations();

  const filteredReservations = userReservations.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            <ClockIcon size={14} />
            <span>SESSION RUNTIME &amp; SETTLEMENTS</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase mt-1">
            Compute Dashboard
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Persistent local session state, live hold countdowns, and running spot spend.
          </p>
        </div>

        <Link
          href="/browse"
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <span>BOOK MORE SILICON</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>

      {/* Real-time Spending & Utilization Summary */}
      <SpendingSummary reservations={userReservations} />

      {/* Reservations List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase tracking-wide">
            Your Reserved Compute Blocks ({userReservations.length})
          </h2>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {(['all', 'held', 'confirmed', 'cancelled', 'expired'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedFilter(status)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors border ${
                  selectedFilter === status
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                    : 'text-slate-500 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-[#0B0E17]/50 p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400">
              <ServerRackIcon size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                NO RESERVATIONS IN THIS STATE
              </h3>
              <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
                You have no compute blocks matching &quot;{selectedFilter}&quot;. Browse the grid to secure bare-metal capacity.
              </p>
            </div>
            <div>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-colors"
              >
                <span>EXPLORE GRID</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((res) => (
              <ReservationItem key={res.id} reservation={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
