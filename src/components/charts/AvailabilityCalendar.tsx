'use client';

import React, { useMemo } from 'react';
import { Listing } from '@/types/listing';
import { Reservation } from '@/types/reservation';
import { isReservationOccupyingSlot, doTimeRangesOverlap } from '@/lib/reservations';
import { CalendarIcon } from '@/components/ui/Icons';
import { ANCHOR_TIMESTAMP } from '@/data/mockListings';

interface AvailabilityCalendarProps {
  listing: Listing;
  reservations: Reservation[];
  onSelectSlot?: (startMs: number, endMs: number) => void;
}

export function AvailabilityCalendar({
  listing,
  reservations,
  onSelectSlot,
}: AvailabilityCalendarProps) {
  const baseTimeMs = ANCHOR_TIMESTAMP;

  // Generate 7 days starting from start of current day
  const days = useMemo(() => {
    const list: {
      date: Date;
      label: string;
      dayOfWeek: string;
      startOfDayMs: number;
    }[] = [];

    const now = new Date(baseTimeMs);
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      list.push({
        date: d,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        dayOfWeek: d.toLocaleDateString([], { weekday: 'short' }),
        startOfDayMs: d.getTime(),
      });
    }
    return list;
  }, [baseTimeMs]);

  // Filter reservations for this listing that are currently occupying slots
  const activeReservations = useMemo(() => {
    return reservations.filter(
      (r) => r.listingId === listing.id && isReservationOccupyingSlot(r, baseTimeMs)
    );
  }, [reservations, listing.id, baseTimeMs]);

  // 6 blocks per day (4 hours each: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24)
  const timeBlocks = [
    { label: '00:00 - 04:00', startHour: 0, durationHours: 4 },
    { label: '04:00 - 08:00', startHour: 4, durationHours: 4 },
    { label: '08:00 - 12:00', startHour: 8, durationHours: 4 },
    { label: '12:00 - 16:00', startHour: 12, durationHours: 4 },
    { label: '16:00 - 20:00', startHour: 16, durationHours: 4 },
    { label: '20:00 - 24:00', startHour: 20, durationHours: 4 },
  ];

  const HOUR_MS = 60 * 60 * 1000;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-cyan-400" />
            <h3 className="font-heading font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
              7-Day Availability Matrix
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Real-time half-open slot reservations &amp; scheduled windows
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/50" />
            <span className="text-slate-600 dark:text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-500/60" />
            <span className="text-cyan-400">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/60" />
            <span className="text-amber-400">Held</span>
          </div>
          {listing.status === 'maintenance' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/60" />
              <span className="text-rose-400">Maintenance</span>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Calendar Table / Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px] divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden font-mono text-xs">
          {/* Header Row */}
          <div className="grid grid-cols-7 bg-slate-100 dark:bg-white/5 text-[11px] text-slate-400 uppercase font-semibold text-center py-2">
            <div className="text-left px-3">Slot Window</div>
            {days.map((day) => (
              <div key={day.startOfDayMs} className="px-1">
                <div>{day.dayOfWeek}</div>
                <div className="text-[9px] text-slate-500">{day.label}</div>
              </div>
            ))}
          </div>

          {/* Time Block Rows */}
          {timeBlocks.map((block) => (
            <div
              key={block.label}
              className="grid grid-cols-7 items-center text-center py-2 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-left px-3 text-[10px] text-slate-500 font-medium">
                {block.label}
              </div>

              {days.map((day) => {
                const slotStart = day.startOfDayMs + block.startHour * HOUR_MS;
                const slotEnd = slotStart + block.durationHours * HOUR_MS;

                // Check overlap with active reservations
                const conflictingRes = activeReservations.find((r) =>
                  doTimeRangesOverlap(slotStart, slotEnd, r.startTime, r.endTime)
                );

                const isMaintenance = listing.status === 'maintenance';
                const isTaken = Boolean(conflictingRes);
                const isHeld = conflictingRes?.status === 'held';

                return (
                  <div key={day.startOfDayMs} className="px-1.5 py-0.5">
                    {isMaintenance ? (
                      <div
                        className="py-1 px-1 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 truncate"
                        title="Machine in maintenance mode"
                      >
                        MAINT
                      </div>
                    ) : isTaken ? (
                      <div
                        className={`py-1 px-1 rounded text-[9px] font-bold border truncate transition-all ${
                          isHeld
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}
                        title={`${isHeld ? 'Held' : 'Confirmed'} Reservation: ${new Date(
                          conflictingRes!.startTime
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(
                          conflictingRes!.endTime
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        {isHeld ? 'HELD' : 'BOOKED'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectSlot && onSelectSlot(slotStart, slotEnd)}
                        className="w-full py-1 px-1 rounded text-[9px] bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        title="Click to select this 4-hour window"
                      >
                        FREE
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
