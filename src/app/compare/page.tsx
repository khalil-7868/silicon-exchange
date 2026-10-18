'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import { useCompareStore } from '@/store/useCompareStore';
import { MOCK_LISTINGS, getListingById } from '@/data/mockListings';
import { REGIONS } from '@/data/regions';
import { formatHourlyRate } from '@/lib/formatters';
import { StatusBadge } from '@/components/ui/Badge';
import { ChipVisual } from '@/components/ui/ChipVisual';
import {
  CompareIcon,
  XIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { useMounted } from '@/lib/useMounted';

export default function ComparePage() {
  const { selectedIds, removeFromCompare, addToCompare, clearCompare } = useCompareStore();
  const mounted = useMounted();
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center font-mono text-xs text-slate-500">
        Loading comparison telemetry...
      </div>
    );
  }

  const comparedListings = selectedIds
    .map((id) => getListingById(id))
    .filter(Boolean);

  const availableToAdd = MOCK_LISTINGS.filter(
    (l) => !selectedIds.includes(l.id)
  );

  const handleAdd = (id: string) => {
    if (id) {
      addToCompare(id);
      setSelectedToAdd('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            <CompareIcon size={14} />
            <span>SIDE-BY-SIDE HARDWARE BENCHMARKS</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase mt-1">
            Compare Accelerator Nodes ({comparedListings.length}/3)
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Evaluate memory bandwidth, interconnect fabric, and spot hourly rates across hardware families.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedListings.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 hover:border-rose-500 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          )}

          <Link
            href="/browse"
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span>ADD FROM GRID</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Add Node Bar if < 3 */}
      {comparedListings.length < 3 && availableToAdd.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-mono">
          <span className="text-cyan-400 font-bold whitespace-nowrap">
            + Quick Add Accelerator:
          </span>
          <select
            value={selectedToAdd}
            onChange={(e) => handleAdd(e.target.value)}
            className="w-full sm:w-80 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0C101A] px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="">Select an accelerator to add...</option>
            {availableToAdd.map((listing) => (
              <option key={listing.id} value={listing.id} className="bg-slate-900 text-white">
                {listing.name} ({formatHourlyRate(listing.hourlyRateCents)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison Matrix */}
      {comparedListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-[#0B0E17]/50 p-16 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400">
            <CompareIcon size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              NO ACCELERATORS SELECTED
            </h3>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              Select up to 3 accelerators from the grid to compare architectural metrics, memory bandwidth, and spot rates side by side.
            </p>
          </div>
          <div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-colors"
            >
              <span>BROWSE GRID</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px] border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0B0E17] divide-y divide-slate-100 dark:divide-white/5 text-xs font-mono shadow-sm">
            {/* Top Row: Chip Card Headers */}
            <div
              className="grid items-stretch p-4 bg-slate-50 dark:bg-white/[0.02]"
              style={{
                gridTemplateColumns: `200px repeat(${comparedListings.length}, 1fr)`,
              }}
            >
              <div className="flex flex-col justify-end pb-2 pr-4 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                ACCELERATOR PROFILE
              </div>

              {comparedListings.map((listing) => (
                <div key={listing!.id} className="p-3 border-l border-slate-200 dark:border-white/10 space-y-3 relative">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={listing!.status} />
                    <button
                      type="button"
                      onClick={() => removeFromCompare(listing!.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-white/5 focus:outline-none"
                      title="Remove from comparison"
                      aria-label={`Remove ${listing!.name}`}
                    >
                      <XIcon size={14} />
                    </button>
                  </div>

                  <div>
                    <h2 className="font-heading font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {listing!.name}
                    </h2>
                    <div className="text-[11px] text-slate-500">
                      {REGIONS[listing!.region].flag} {REGIONS[listing!.region].name}
                    </div>
                  </div>

                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {formatHourlyRate(listing!.hourlyRateCents)}
                  </div>

                  <Link
                    href={`/listings/${listing!.slug}`}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-white text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    <span>RESERVE NODE</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>
              ))}
            </div>

            {/* Spec Diff Rows */}
            {[
              {
                label: 'Silicon Die',
                render: (l: Listing) => <ChipVisual chip={l.chip} compact />,
              },
              {
                label: 'Architecture',
                render: (l: Listing) => (
                  <span className="font-bold text-slate-900 dark:text-white">{l.architecture}</span>
                ),
              },
              {
                label: 'VRAM Capacity',
                render: (l: Listing) => (
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {l.memoryGb} GB <span className="text-[10px] text-slate-500">{l.memoryType}</span>
                  </span>
                ),
              },
              {
                label: 'Memory Bandwidth',
                render: (l: Listing) => (
                  <span className="font-bold text-slate-900 dark:text-white">
                    {l.memoryBandwidthGbps.toLocaleString()} GB/s
                  </span>
                ),
              },
              {
                label: 'Compute (TFLOPS)',
                render: (l: Listing) => (
                  <span className="font-bold text-slate-900 dark:text-white">
                    {l.tflops.toLocaleString()} TFLOPS
                  </span>
                ),
              },
              {
                label: 'Thermal TDP',
                render: (l: Listing) => (
                  <span className="text-amber-500 font-bold">{l.tdpWatts} Watts</span>
                ),
              },
              {
                label: 'Interconnect Fabric',
                render: (l: Listing) => (
                  <span className="text-slate-700 dark:text-slate-300">{l.pciGen}</span>
                ),
              },
              {
                label: 'Host CPU',
                render: (l: Listing) => (
                  <span className="text-slate-700 dark:text-slate-300 truncate block">{l.hostCpu}</span>
                ),
              },
              {
                label: 'Host RAM / Storage',
                render: (l: Listing) => (
                  <span>
                    {l.hostRamGb}GB RAM // {l.storageNvmeGb}GB NVMe
                  </span>
                ),
              },
              {
                label: 'Live Utilization',
                render: (l: Listing) => (
                  <span className="font-bold text-slate-900 dark:text-white">
                    {l.currentUtilization}% ({l.currentPowerWatts}W)
                  </span>
                ),
              },
              {
                label: 'Datacenter Tier',
                render: (l: Listing) => (
                  <span>
                    {l.provider.name} ({l.provider.tier})
                  </span>
                ),
              },
              {
                label: 'Clean Energy',
                render: (l: Listing) => (
                  <span className={l.provider.renewableEnergy ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                    {l.provider.renewableEnergy ? '✓ 100% Renewable' : 'Standard Grid'}
                  </span>
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="grid items-center p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                style={{
                  gridTemplateColumns: `200px repeat(${comparedListings.length}, 1fr)`,
                }}
              >
                <div className="text-slate-500 uppercase tracking-wider text-[11px] pr-4">
                  {row.label}
                </div>
                {comparedListings.map((listing) => (
                  <div
                    key={listing!.id}
                    className="p-2 border-l border-slate-100 dark:border-white/5"
                  >
                    {row.render(listing!)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
