'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import { REGIONS } from '@/data/regions';
import { StatusBadge } from '@/components/ui/Badge';
import { ChipVisual } from '@/components/ui/ChipVisual';
import { UtilizationChart } from '@/components/charts/UtilizationChart';
import { AvailabilityCalendar } from '@/components/charts/AvailabilityCalendar';
import { ReservationWidget } from '@/components/reservation/ReservationWidget';
import { useCompareStore } from '@/store/useCompareStore';
import { useReservationStore } from '@/store/useReservationStore';
import {
  GpuIcon,
  ServerRackIcon,
  CompareIcon,
} from '@/components/ui/Icons';

interface ListingDetailClientProps {
  listing: Listing;
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const { toggleCompare, isCompared } = useCompareStore();
  const { reservations } = useReservationStore();
  const region = REGIONS[listing.region];
  const compared = isCompared(listing.id);

  // Allow clicking free slot on calendar to populate reservation form
  const [selectedSlot, setSelectedSlot] = useState<{
    startMs: number;
    endMs: number;
  } | null>(null);

  const handleSelectSlot = (startMs: number, endMs: number) => {
    setSelectedSlot({ startMs, endMs });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 page-enter">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Link href="/browse" className="hover:text-cyan-400 transition-colors">
              GRID
            </Link>
            <span>/</span>
            <span className="text-slate-400">{listing.region.toUpperCase()}</span>
            <span>/</span>
            <span className="text-cyan-500 dark:text-cyan-400 uppercase">{listing.slug}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase">
              {listing.name}
            </h1>
            <StatusBadge status={listing.status} size="md" />
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-2">
            <span>{region.flag} {region.name} ({region.location})</span>
            <span>•</span>
            <span className="text-emerald-500">{region.latencyAvgMs}ms avg ping</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleCompare(listing.id)}
            className={`px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-colors border flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              compared
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            <CompareIcon size={14} />
            <span>{compared ? 'IN COMPARE DOCK' : 'ADD TO COMPARE'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Specs, Chart, Calendar) vs Right Column (Reservation Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Spec Sheet & Silicon Die Topology */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                <GpuIcon size={16} className="text-cyan-400" />
                <span>Bare-Metal Hardware Spec Sheet</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                HOST NODE VERIFIED
              </span>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Chip Model</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.chip}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Microarchitecture</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{listing.architecture}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">VRAM Capacity</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.memoryGb} GB {listing.memoryType}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">VRAM Bandwidth</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.memoryBandwidthGbps.toLocaleString()} GB/s</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tensor Compute</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.tflops.toLocaleString()} TFLOPS</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Thermal TDP</span>
                <span className="font-bold text-amber-500">{listing.tdpWatts} Watts</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Interconnect Fabric</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{listing.pciGen}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Host CPU</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{listing.hostCpu}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Host Memory / NVMe</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {listing.hostRamGb}GB RAM // {listing.storageNvmeGb}GB SSD
                </span>
              </div>
            </div>

            {/* Die Visualizer */}
            <ChipVisual chip={listing.chip} />

            {/* Provider and datacenter certifications */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <ServerRackIcon size={14} className="text-cyan-400" />
                <span>Datacenter: <strong className="text-slate-800 dark:text-slate-200">{listing.provider.name}</strong> ({listing.provider.tier})</span>
              </div>
              <div className="flex items-center gap-4">
                <span>90d Uptime: <strong className="text-emerald-500">{listing.provider.uptime90d}%</strong></span>
                {listing.provider.renewableEnergy && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                    100% GREEN HYDRO/SOLAR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 24-Hour Telemetry Line Chart */}
          <UtilizationChart samples={listing.utilizationSamples} tdpWatts={listing.tdpWatts} />

          {/* 7-Day Slot Availability Calendar */}
          <AvailabilityCalendar
            listing={listing}
            reservations={reservations}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        {/* Right Column (5 cols on lg) Sticky Reservation Widget */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <ReservationWidget
            key={`${selectedSlot?.startMs || 'default'}-${selectedSlot?.endMs || 'default'}`}
            listing={listing}
            selectedStartMs={selectedSlot?.startMs}
            selectedEndMs={selectedSlot?.endMs}
          />
        </div>
      </div>
    </div>
  );
}
