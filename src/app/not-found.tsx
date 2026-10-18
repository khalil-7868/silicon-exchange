import React from 'react';
import Link from 'next/link';
import { GpuIcon, ServerRackIcon } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-[#0B0E17] p-8 shadow-2xl space-y-6 text-center font-mono">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <GpuIcon size={32} />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] text-rose-400 uppercase tracking-widest font-bold">
            0x404 // FABRIC_ADDRESS_UNRESOLVED
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Node Disconnected
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The compute endpoint or accelerator slug you requested does not exist in the active cluster routing table, or has been decommissioned from the spot pool.
          </p>
        </div>

        {/* Terminal Diagnostic box */}
        <div className="rounded-lg bg-[#07090E] border border-white/5 p-3 text-left text-[11px] text-slate-500 space-y-1">
          <div>$ ping -c 1 /current-route</div>
          <div className="text-rose-400">host lookup failed: NXDOMAIN in cluster fabric</div>
          <div>$ tracepath --port 443 silicon.exchange</div>
          <div className="text-emerald-400">1: gateway.ashburn.sx.net 0.42ms OK</div>
          <div className="text-amber-400">2: * * * [packet dropped at boundary]</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/browse"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <ServerRackIcon size={14} />
            <span>ACCELERATOR GRID</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 text-xs font-medium tracking-wider uppercase transition-colors"
          >
            TERMINAL ROOT
          </Link>
        </div>
      </div>
    </div>
  );
}
