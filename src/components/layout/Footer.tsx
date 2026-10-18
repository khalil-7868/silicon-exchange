'use client';

import React from 'react';
import Link from 'next/link';
import { GpuIcon, ShieldIcon, ZapIcon, ClockIcon } from '@/components/ui/Icons';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05070B] text-slate-600 dark:text-slate-400 text-xs font-mono transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm tracking-widest">
              <GpuIcon size={16} className="text-cyan-400" />
              <span>SILICON EXCHANGE</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Decentralized peer-to-peer compute liquidity. Reserve bare-metal AI accelerators by the hour with guaranteed sub-hourly 15-minute billing granularity.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ENGINE: DETERMINISTIC PURE TS ENGINE</span>
            </div>
          </div>

          {/* Col 2: Pricing Spec */}
          <div className="space-y-2">
            <h2 className="text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ClockIcon size={13} className="text-cyan-400" />
              Billing Protocol
            </h2>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• 15-minute increments, rounded UP</li>
              <li>• 1-hour minimum billable block</li>
              <li>• 10% discount on continuous hours &gt; 24h</li>
              <li>• Zero floating point arithmetic (integer cents)</li>
            </ul>
          </div>

          {/* Col 3: Network Topology */}
          <div className="space-y-2">
            <h2 className="text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ZapIcon size={13} className="text-cyan-400" />
              Active Edge Regions
            </h2>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li>• US-East: Ashburn Tier IV (NVLink 4.0)</li>
              <li>• US-West: Hillsboro Clean Hydro (PCIe 5.0)</li>
              <li>• EU-West: Dublin Ireland Tier IV</li>
              <li>• EU-Central: Frankfurt Germany (UALink)</li>
              <li>• AP-Northeast: Tokyo Japan Hub</li>
            </ul>
          </div>

          {/* Col 4: Safety & Holds */}
          <div className="space-y-2">
            <h2 className="text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldIcon size={13} className="text-cyan-400" />
              Hold Guarantee
            </h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unconfirmed reservations hold slots for exactly 10 minutes before auto-expiring to ensure equal liquidity across global tenants.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[11px] text-cyan-500 dark:text-cyan-400 hover:underline"
              >
                Inspect active sessions →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 SILICON EXCHANGE INC. ALL HARDWARE SPECIFICATIONS DETERMINISTICALLY GENERATED.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/browse" className="hover:text-cyan-400 transition-colors">Grid</Link>
            <Link href="/compare" className="hover:text-cyan-400 transition-colors">Compare</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
