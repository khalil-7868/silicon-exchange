import React from 'react';
import Link from 'next/link';
import { MOCK_LISTINGS } from '@/data/mockListings';
import { formatHourlyRate } from '@/lib/formatters';
import {
  ServerRackIcon,
  ClockIcon,
  ShieldIcon,
  ArrowRightIcon,
  CompareIcon,
} from '@/components/ui/Icons';
import { ListingCard } from '@/components/listings/ListingCard';

export default function HomePage() {
  // Compute real metrics dynamically from the deterministic mock data
  const availableListings = MOCK_LISTINGS.filter((l) => l.status === 'available');
  const onlineCount = availableListings.length;
  const totalCount = MOCK_LISTINGS.length;

  const totalTflops = availableListings.reduce((sum, l) => sum + l.tflops, 0);
  const minRateCents = Math.min(...availableListings.map((l) => l.hourlyRateCents));
  const avgUtilization = Math.round(
    availableListings.reduce((sum, l) => sum + l.currentUtilization, 0) / (availableListings.length || 1)
  );

  // Pick top 3 premier nodes to feature
  const featuredNodes = [
    MOCK_LISTINGS.find((l) => l.slug === 'h100-sxm5-ashburn-01')!,
    MOCK_LISTINGS.find((l) => l.slug === 'b200-sxm6-ashburn-03')!,
    MOCK_LISTINGS.find((l) => l.slug === 'mi300x-frankfurt-06')!,
  ].filter(Boolean);

  return (
    <div className="flex flex-col space-y-16 pb-20 page-enter">
      {/* 1. Hero Section with Animated Gradient & Live Ticker */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-white/5">
        {/* Animated Glow Mesh in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-emerald-500/15 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* System Status Ticker */}
            <div className="inline-flex w-fit items-center gap-2.5 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-xs font-mono text-cyan-600 dark:text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span>MARKETPLACE LIVE // {onlineCount} OF {totalCount} ACCELERATOR NODES ONLINE</span>
            </div>

            {/* Headline with animated glow background */}
            <div className="space-y-2">
              <h1 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                RENT IDLE <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 dark:from-cyan-400 dark:via-emerald-300 dark:to-blue-400 bg-clip-text text-transparent">BARE-METAL SILICON</span> BY THE HOUR.
              </h1>
              <p className="text-sm sm:text-base font-mono text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Decentralized spot capacity for LLM training, diffusion pipelines, and batch inference. 15-minute precision billing. Direct NVLink &amp; PCIe 5.0 hardware passthrough.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/browse"
                className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.35)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <span>ENTER ACCELERATOR GRID</span>
                <ArrowRightIcon size={16} />
              </Link>
              <Link
                href="/compare"
                className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-cyan-500/40 bg-white/50 dark:bg-white/5 text-slate-800 dark:text-slate-200 font-mono font-medium text-sm tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <CompareIcon size={16} className="text-cyan-400" />
                <span>DIFF SPECS (3-WAY)</span>
              </Link>
            </div>
          </div>

          {/* Real Live Metrics Bar computed from mock data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B0E17]/80 backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Accelerators Online
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {onlineCount} <span className="text-xs text-slate-500">/ {totalCount}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-500 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>6 Regions Active</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B0E17]/80 backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Aggregated Compute
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                {totalTflops.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Tensor / FP16 TFLOPS
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B0E17]/80 backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Network Load
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {avgUtilization}%
              </div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">
                Live Dynamic Telemetry
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B0E17]/80 backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Starting Spot Rate
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatHourlyRate(minRateCents)}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Zero Hidden Markups
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            ENGINEERING GUARANTEES
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase tracking-tight">
            Built Like an Institutional Trading Terminal
          </h2>
          <p className="text-xs font-mono text-slate-500">
            Engineered for low-latency AI engineering teams who demand precision scheduling and bare-metal throughput.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <ServerRackIcon size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                Zero Overhead Bare-Metal
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct PCIe 5.0 and NVLink 4.0 pass-through without virtualization layers or shared memory contention. Full memory bandwidth unlocked from second zero.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-cyan-500 dark:text-cyan-400 flex items-center gap-1">
              <span>900 GB/s to 8,000 GB/s interconnects</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ClockIcon size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                15-Min Precision Billing
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                Never pay for idle hours. Micro-blocks round up to exact 15-minute intervals with a 1-hour minimum. Continuous reservations beyond 24h get 10% off excess hours automatically.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-emerald-500 flex items-center gap-1">
              <span>100% integer cents precision math</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <ShieldIcon size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                10-Minute Hold Lock Settlement
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                Unconfirmed checkouts hold time slots for exactly 10 minutes with live countdown timers. Abandoned holds auto-expire to keep compute liquidity fair and open.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-amber-500 flex items-center gap-1">
              <span>Half-open boundary overlap verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Accelerators Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              INSTANT SPOT CAPACITY
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white uppercase">
              Premier Compute Nodes
            </h2>
          </div>
          <Link
            href="/browse"
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-500 dark:text-cyan-400 hover:underline font-bold"
          >
            <span>VIEW ALL 24 NODES IN GRID</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredNodes.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* 4. Bottom Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#0C101A] via-[#090C14] to-[#0A0D18] p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 inline-block">
              READY FOR WORKLOAD ORCHESTRATION
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Deploy LLM Fine-Tuning or Batch Inference in Minutes.
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 leading-relaxed">
              Browse 24 bare-metal clusters across 6 global regions. Inspect 30 days of telemetry traces and secure guaranteed spot windows today.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/browse"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                BROWSE FULL GRID →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
