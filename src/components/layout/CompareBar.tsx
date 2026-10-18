'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/store/useCompareStore';
import { getListingById } from '@/data/mockListings';
import { CompareIcon, XIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { formatHourlyRate } from '@/lib/formatters';
import { useMounted } from '@/lib/useMounted';

export function CompareBar() {
  const pathname = usePathname();
  const { selectedIds, removeFromCompare, clearCompare } = useCompareStore();
  const mounted = useMounted();

  // Don't show compare bar if user is already on /compare page or no items selected
  if (pathname === '/compare' || selectedIds.length === 0 || !mounted) {
    return null;
  }

  const comparedListings = selectedIds
    .map((id) => getListingById(id))
    .filter(Boolean);

  return (
    <aside
      aria-label="Accelerator comparison dock"
      className={[
        // position + size
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl',
        // light background with subtle border
        'bg-white/95 dark:bg-[#0B0E17]/95',
        'border border-slate-200 dark:border-cyan-500/40',
        // shadow
        'shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.15)]',
        // blur + rounding
        'backdrop-blur-md rounded-xl',
        // text colour
        'text-slate-800 dark:text-slate-200',
        // animate in
        'transition-all animate-in slide-in-from-bottom-5 duration-300',
      ].join(' ')}
    >
      {/* Cyan accent rule at the top */}
      <div className="h-[2px] rounded-t-xl w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="p-3">
        {/* Single-row layout on sm+ */}
        <div className="flex items-center gap-3">
          {/* Icon + label — always visible, shrinks last */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="p-2 rounded bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/30 flex-shrink-0">
              <CompareIcon size={15} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                COMPARE DOCK
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25 text-[10px]">
                  {selectedIds.length}/3
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Side-by-side spec &amp; pricing diff
              </div>
            </div>
          </div>

          {/* Chip pills — scrollable, takes available space */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 py-1 min-w-0">
            {comparedListings.map((listing) => (
              <div
                key={listing!.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex-shrink-0 hover:border-cyan-500/40 transition-colors"
              >
                <span className="truncate max-w-[90px]">{listing!.chip}</span>
                <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-semibold">
                  {formatHourlyRate(listing!.hourlyRateCents)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(listing!.id)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-0.5 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors"
                  aria-label={`Remove ${listing!.name} from compare`}
                >
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions — always pinned right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={clearCompare}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
            >
              Clear
            </button>
            <Link
              href="/compare"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 whitespace-nowrap"
            >
              <span>DIFF NOW</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>

        {/* Mobile: icon count + actions in a second row below */}
        <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-500">
          <span>{selectedIds.length} node{selectedIds.length !== 1 ? 's' : ''} queued for comparison</span>
        </div>
      </div>
    </aside>
  );
}
