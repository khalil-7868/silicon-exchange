'use client';

import React from 'react';
import { Reservation } from '@/types/reservation';
import { formatCents } from '@/lib/formatters';
import { StatCard } from '@/components/ui/StatCard';
import { ZapIcon, ClockIcon, ShieldIcon } from '@/components/ui/Icons';

interface SpendingSummaryProps {
  reservations: Reservation[];
}

export function SpendingSummary({ reservations }: SpendingSummaryProps) {
  const confirmedRes = reservations.filter((r) => r.status === 'confirmed');
  const heldRes = reservations.filter((r) => r.status === 'held');

  const totalSpendCents = reservations.reduce((sum, r) => {
    if (r.status === 'confirmed' || r.status === 'held') {
      return sum + r.priceQuote.totalCostCents;
    }
    return sum;
  }, 0);

  const totalHoursBooked = reservations.reduce((sum, r) => {
    if (r.status === 'confirmed' || r.status === 'held') {
      return sum + r.priceQuote.billableHours;
    }
    return sum;
  }, 0);

  const totalDiscountSavedCents = reservations.reduce((sum, r) => {
    if (r.status === 'confirmed' || r.status === 'held') {
      return sum + r.priceQuote.discountCents;
    }
    return sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Active Spend"
        value={formatCents(totalSpendCents)}
        subtext="Sum of confirmed & held blocks"
        icon={<ZapIcon size={16} />}
      />

      <StatCard
        label="Compute Reserved"
        value={totalHoursBooked}
        unit="HOURS"
        subtext="15m precision billed blocks"
        icon={<ClockIcon size={16} />}
      />

      <StatCard
        label="Active Sessions"
        value={confirmedRes.length}
        subtext={`${heldRes.length} currently on 10m hold`}
        icon={<ShieldIcon size={16} />}
      />

      <StatCard
        label="Volume Savings"
        value={formatCents(totalDiscountSavedCents)}
        subtext="10% discount on continuous >24h"
        icon={<ZapIcon size={16} className="text-emerald-400" />}
      />
    </div>
  );
}
