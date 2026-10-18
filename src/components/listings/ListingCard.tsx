'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import { StatusBadge } from '@/components/ui/Badge';
import { REGIONS } from '@/data/regions';
import { formatHourlyRate } from '@/lib/formatters';
import { useCompareStore } from '@/store/useCompareStore';
import { ZapIcon, CompareIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ChipVisual } from '@/components/ui/ChipVisual';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { toggleCompare, isCompared, selectedIds } = useCompareStore();
  const region = REGIONS[listing.region];
  const compared = isCompared(listing.id);
  const compareDisabled = !compared && selectedIds.length >= 3;

  // Determine utilization bar color
  let utilColor = 'bg-emerald-500';
  if (listing.currentUtilization > 85) {
    utilColor = 'bg-amber-500';
  } else if (listing.currentUtilization > 50) {
    utilColor = 'bg-cyan-500';
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] hover:border-cyan-500/50 dark:hover:border-cyan-500/40 shadow-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)] transition-all duration-300 overflow-hidden">
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent group-hover:via-cyan-400 transition-all" />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header: Status & Compare Button */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <StatusBadge status={listing.status} />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(listing.id);
              }}
              disabled={compareDisabled}
              title={
                compareDisabled
                  ? 'Max 3 nodes in comparison dock'
                  : compared
                  ? 'Remove from compare'
                  : 'Add to compare'
              }
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono tracking-wider transition-colors border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                compared
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : compareDisabled
                  ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <CompareIcon size={12} />
              <span>{compared ? 'COMPARED' : 'DIFF'}</span>
            </button>
          </div>

          {/* Title & Chip details */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                  <Link href={`/listings/${listing.slug}`} className="focus:outline-none focus:underline">
                    {listing.name}
                  </Link>
                </h3>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{listing.architecture}</span>
                  <span>•</span>
                  <span>{listing.pciGen.split(' ')[0]}</span>
                </div>
              </div>
              <ChipVisual chip={listing.chip} compact />
            </div>

            {/* Region & Datacenter */}
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-100 dark:border-white/5">
              <span>{region.flag}</span>
              <span className="truncate">{region.name}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400">{region.latencyAvgMs}ms</span>
            </div>
          </div>

          {/* Key Spec Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 dark:border-white/5 mb-4 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Memory</div>
              <div className="font-bold text-slate-900 dark:text-slate-200">
                {listing.memoryGb} GB <span className="text-[10px] font-normal text-slate-500">{listing.memoryType}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Compute</div>
              <div className="font-bold text-slate-900 dark:text-slate-200">
                {listing.tflops.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">TFLOPS</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Bandwidth</div>
              <div className="font-bold text-slate-900 dark:text-slate-200">
                {listing.memoryBandwidthGbps} <span className="text-[10px] font-normal text-slate-500">GB/s</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Max TDP</div>
              <div className="font-bold text-slate-900 dark:text-slate-200">
                {listing.tdpWatts} <span className="text-[10px] font-normal text-slate-500">Watts</span>
              </div>
            </div>
          </div>

          {/* Current Utilization Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <ZapIcon size={12} className="text-amber-500" />
                Live Utilization
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-200">
                {listing.currentUtilization}% ({listing.currentPowerWatts}W)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${utilColor}`}
                style={{ width: `${listing.currentUtilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Hourly Rate</div>
            <div className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400">
              {formatHourlyRate(listing.hourlyRateCents)}
            </div>
          </div>

          <Link
            href={`/listings/${listing.slug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-white text-xs font-mono font-medium tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <span>INSPECT</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
