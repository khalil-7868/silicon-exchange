import React from 'react';
import { PriceQuote } from '@/types/reservation';
import { formatCents, formatDuration } from '@/lib/formatters';
import { ZapIcon, ClockIcon } from '@/components/ui/Icons';

interface PriceBreakdownProps {
  quote: PriceQuote;
}

export function PriceBreakdown({ quote }: PriceBreakdownProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 text-xs font-mono space-y-3">
      <div className="flex items-center justify-between text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-white/10 pb-2">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <ClockIcon size={14} className="text-cyan-400" />
          Pricing Breakdown
        </span>
        <span className="text-cyan-600 dark:text-cyan-400 font-bold">
          {formatCents(quote.hourlyRateCents)}/hr
        </span>
      </div>

      <div className="space-y-2 text-slate-600 dark:text-slate-400">
        {/* Raw vs Rounded Duration */}
        <div className="flex items-center justify-between">
          <span>Requested Duration:</span>
          <span className="font-medium text-slate-900 dark:text-slate-200">
            {formatDuration(quote.rawDurationMinutes)}
          </span>
        </div>

        {/* 15m increment round up notice */}
        {quote.roundingAddedMinutes > 0 && (
          <div className="flex items-center justify-between text-[11px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
            <span>15m Precision Round-Up:</span>
            <span>+{quote.roundingAddedMinutes}m (Billed: {quote.billableHours}h)</span>
          </div>
        )}

        {/* Base 24 Hours Cost */}
        <div className="flex items-center justify-between">
          <span>
            Base Block ({quote.baseHours}h × {formatCents(quote.hourlyRateCents)}):
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-200">
            {formatCents(quote.baseCostCents)}
          </span>
        </div>

        {/* Excess Hours (> 24h) */}
        {quote.excessHours > 0 && (
          <>
            <div className="flex items-center justify-between text-slate-500">
              <span>Excess Block ({quote.excessHours}h beyond 24h):</span>
              <span>{formatCents(quote.excessBeforeDiscountCents)}</span>
            </div>

            {/* 10% discount on excess */}
            <div className="flex items-center justify-between text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
              <span className="flex items-center gap-1">
                <ZapIcon size={12} />
                Long-Job Discount (10% on excess {quote.excessHours}h):
              </span>
              <span>-{formatCents(quote.discountCents)}</span>
            </div>
          </>
        )}
      </div>

      {/* Total Cents */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Billable Amount</div>
          <div className="text-[10px] text-slate-400">Guaranteed integer cents rate</div>
        </div>
        <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
          {formatCents(quote.totalCostCents)}
        </div>
      </div>
    </div>
  );
}
