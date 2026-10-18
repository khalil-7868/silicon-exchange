'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import { PriceQuote, Reservation } from '@/types/reservation';
import { calculatePriceQuote } from '@/lib/pricing';
import { canReserveListing } from '@/lib/reservations';
import { useReservationStore } from '@/store/useReservationStore';
import { PriceBreakdown } from './PriceBreakdown';
import { formatDateTime, formatDuration } from '@/lib/formatters';
import {
  ClockIcon,
  AlertTriangleIcon,
  CheckIcon,
  ZapIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

import { ANCHOR_TIMESTAMP } from '@/data/mockListings';

interface ReservationWidgetProps {
  listing: Listing;
  selectedStartMs?: number;
  selectedEndMs?: number;
}

export function ReservationWidget({
  listing,
  selectedStartMs,
  selectedEndMs,
}: ReservationWidgetProps) {
  const { reservations, createHoldReservation } = useReservationStore();
  const currentClientTime = ANCHOR_TIMESTAMP;

  const [startTimeMs, setStartTimeMs] = useState<number>(() => {
    return selectedStartMs || (ANCHOR_TIMESTAMP + 60 * 60 * 1000);
  });

  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    return selectedEndMs && selectedStartMs
      ? Math.max(60, (selectedEndMs - selectedStartMs) / 60000)
      : 240;
  });
  const [clientNotes, setClientNotes] = useState<string>('Production LLM Inference Cluster');
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const endTimeMs = startTimeMs + durationMinutes * 60 * 1000;

  // 1. Calculate live price quote
  const priceQuote: PriceQuote = useMemo(() => {
    return calculatePriceQuote(startTimeMs, endTimeMs, listing.hourlyRateCents);
  }, [startTimeMs, endTimeMs, listing.hourlyRateCents]);

  // 2. Real-time overlap & maintenance validation
  const validationResult = useMemo(() => {
    return canReserveListing(listing, startTimeMs, endTimeMs, reservations, currentClientTime);
  }, [listing, startTimeMs, endTimeMs, reservations, currentClientTime]);

  // Preset quick selections
  const presetDurations = [
    { label: '1 Hour', minutes: 60 },
    { label: '4 Hours', minutes: 240 },
    { label: '12 Hours', minutes: 720 },
    { label: '24 Hours', minutes: 1440 },
    { label: '48 Hours (10% Off)', minutes: 2880 },
  ];

  const handleHoldReservation = () => {
    setSubmissionError(null);
    const result = createHoldReservation(
      listing,
      startTimeMs,
      endTimeMs,
      clientNotes
    );

    if (result.success && result.reservation) {
      setCreatedReservation(result.reservation);
    } else {
      setSubmissionError(result.error || 'Failed to hold time block.');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <ClockIcon size={18} className="text-cyan-400" />
          <h2 className="font-heading font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            Spot Time Reservation
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          10-MIN HOLD WINDOW
        </span>
      </div>

      {/* Success banner if held */}
      {createdReservation && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <CheckIcon size={16} />
            <span>Time Slot Held Successfully!</span>
          </div>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Your reservation on <strong className="text-white">{listing.chip}</strong> is secured in our state engine for 10 minutes.
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono text-cyan-300 font-bold">
              Expires in 10:00 minutes
            </span>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>GO TO DASHBOARD</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* If Listing is in maintenance */}
      {listing.status === 'maintenance' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-xs font-mono text-amber-400">
          <AlertTriangleIcon size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider mb-0.5">
              Scheduled Maintenance Active
            </div>
            <div>
              New reservations are blocked until hardware diagnostics and fluid servicing conclude.
            </div>
          </div>
        </div>
      )}

      {/* Conflict error warning */}
      {!validationResult.allowed && listing.status !== 'maintenance' && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs font-mono text-rose-400">
          <AlertTriangleIcon size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider mb-0.5">Time Slot Conflict</div>
            <div>{validationResult.reason}</div>
          </div>
        </div>
      )}

      {/* Start Time Config */}
      <div className="space-y-2">
        <label htmlFor="res-start-time" className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Reservation Start Time (UTC)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            id="res-start-time"
            type="datetime-local"
            value={new Date(startTimeMs - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            onChange={(e) => {
              const parsed = new Date(e.target.value).getTime();
              if (!isNaN(parsed)) {
                setStartTimeMs(parsed);
              }
            }}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <div className="flex items-center text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
            <span>End: </span>
            <span className="font-bold text-slate-900 dark:text-slate-200 ml-1.5">
              {formatDateTime(endTimeMs)}
            </span>
          </div>
        </div>
      </div>

      {/* Duration Range Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <label htmlFor="duration-slider" className="uppercase tracking-wider text-slate-500">
            Duration Block: <strong className="text-slate-900 dark:text-cyan-400 font-bold">{formatDuration(durationMinutes)}</strong>
          </label>
          <span className="text-slate-500">15m precision steps</span>
        </div>

        {/* Draggable slider with 15-minute increments (0.25h) */}
        <input
          id="duration-slider"
          type="range"
          min={60}
          max={4320} // up to 72 hours
          step={15}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {presetDurations.map((preset) => {
            const active = durationMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => setDurationMinutes(preset.minutes)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-colors border ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Client Job Note */}
      <div className="space-y-1.5">
        <label htmlFor="res-job-purpose" className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Workload / Run Identifier
        </label>
        <input
          id="res-job-purpose"
          type="text"
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          placeholder="e.g. Llama 3 70B Quantized Batch Run..."
          className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Live Transparent Price Quote */}
      <PriceBreakdown quote={priceQuote} />

      {/* Reserve Action Button */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleHoldReservation}
          disabled={!validationResult.allowed}
          className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            validationResult.allowed
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] cursor-pointer'
              : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-white/5'
          }`}
        >
          <ZapIcon size={16} />
          <span>HOLD SPOT BLOCK (10-MIN WINDOW)</span>
        </button>

        {submissionError && (
          <p className="text-[11px] font-mono text-rose-400 text-center">
            {submissionError}
          </p>
        )}

        <p className="text-[10px] font-mono text-slate-500 text-center">
          *Reservations are placed on hold for 10 minutes. Slots unconfirmed after 10m are released back into the grid.
        </p>
      </div>
    </div>
  );
}
