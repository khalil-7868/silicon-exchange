'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { GpuIcon, ServerRackIcon } from '@/components/ui/Icons';
import { useCompareStore } from '@/store/useCompareStore';
import { useReservationStore } from '@/store/useReservationStore';
import { useMounted } from '@/lib/useMounted';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useMounted();

  const selectedCompareIds = useCompareStore((state) => state.selectedIds);
  const reservations = useReservationStore((state) => state.reservations);
  const userReservationIds = useReservationStore((state) => state.userReservationIds);
  const checkAndExpireHolds = useReservationStore((state) => state.checkAndExpireHolds);

  // Periodic hold expiry check (every 5 seconds)
  useEffect(() => {
    checkAndExpireHolds();
    const interval = setInterval(() => {
      checkAndExpireHolds();
    }, 5000);
    return () => clearInterval(interval);
  }, [checkAndExpireHolds]);

  const { activeHoldsCount, activeConfirmedCount } = useMemo(() => {
    const userSet = new Set(userReservationIds);
    let holds = 0;
    let confirmed = 0;
    for (const r of reservations) {
      if (userSet.has(r.id)) {
        if (r.status === 'held') holds++;
        else if (r.status === 'confirmed') confirmed++;
      }
    }
    return { activeHoldsCount: holds, activeConfirmedCount: confirmed };
  }, [reservations, userReservationIds]);

  const compareBadge = mounted && selectedCompareIds.length > 0 ? `${selectedCompareIds.length}/3` : null;
  const isHolding = mounted && activeHoldsCount > 0;
  const reservationsBadge = mounted
    ? activeHoldsCount > 0
      ? `${activeHoldsCount} HELD`
      : activeConfirmedCount > 0
      ? `${activeConfirmedCount} ACTIVE`
      : null
    : null;

  const navLinks = [
    { href: '/', label: 'TERMINAL' },
    { href: '/browse', label: 'ACCELERATOR GRID' },
    {
      href: '/compare',
      label: 'COMPARE',
      badge: compareBadge,
    },
    {
      href: '/dashboard',
      label: 'MY RESERVATIONS',
      badge: reservationsBadge,
      badgeColor: isHolding ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#07090E]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-md py-1 px-1.5"
            aria-label="Silicon Exchange home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/80 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.35)] transition-all">
              <GpuIcon size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-widest text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                SILICON<span className="text-cyan-500 dark:text-cyan-400">EXCHANGE</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase -mt-0.5">
                BARE-METAL COMPUTE SPOT
              </span>
            </div>
          </Link>

          {/* System status pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>24 NODES LIVE // 0.00% PACKET LOSS</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 text-xs font-mono font-medium tracking-wider transition-all rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                  isActive
                    ? 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      link.badgeColor || 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <ServerRackIcon size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090C14] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded text-xs font-mono tracking-wider ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/20 bg-white/10">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-500">
            <span>NETWORK: OPERATIONAL</span>
            <span>24 BARE-METAL INSTANCES</span>
          </div>
        </div>
      )}
    </header>
  );
}
