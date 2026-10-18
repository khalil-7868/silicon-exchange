import { PriceQuote } from '@/types/reservation';

/**
 * Calculates deterministic pricing for an accelerator reservation.
 *
 * Rules:
 * 1. Billed in 15-minute increments, always rounded UP.
 * 2. Minimum billable block is 1 hour (60 minutes).
 * 3. Any reservation longer than 24 continuous hours gets 10% off every hour
 *    beyond the 24th — not off the whole booking.
 * 4. All money calculations are conducted in integer cents.
 */
export function calculatePriceQuote(
  startMs: number,
  endMs: number,
  hourlyRateCents: number
): PriceQuote {
  if (endMs <= startMs) {
    throw new Error('End time must be strictly after start time');
  }
  if (hourlyRateCents < 0) {
    throw new Error('Hourly rate cannot be negative');
  }

  const rawDurationMs = endMs - startMs;
  const rawDurationMinutes = rawDurationMs / (60 * 1000);

  // Round up to nearest 15 minutes
  const roundedUpTo15 = Math.ceil(rawDurationMinutes / 15) * 15;

  // Minimum billable block is 1 hour (60 minutes)
  const billableMinutes = Math.max(60, roundedUpTo15);
  const billableHours = billableMinutes / 60;

  // Split into base hours (up to 24h) and excess hours (> 24h)
  const baseHours = Math.min(24, billableHours);
  const excessHours = Math.max(0, billableHours - 24);

  // Calculate base cost in integer cents
  const baseCostCents = Math.round(baseHours * hourlyRateCents);

  // Calculate excess hours cost and 10% discount on excess only
  const excessBeforeDiscountCents = Math.round(excessHours * hourlyRateCents);
  const discountCents = Math.round(excessBeforeDiscountCents * 0.10);
  const excessCostCents = excessBeforeDiscountCents - discountCents;

  const totalCostCents = baseCostCents + excessCostCents;
  const roundingAddedMinutes = Math.max(0, billableMinutes - rawDurationMinutes);

  return {
    rawDurationMinutes,
    roundedDurationMinutes: billableMinutes,
    billableHours,
    baseHours,
    excessHours,
    hourlyRateCents,
    baseCostCents,
    excessBeforeDiscountCents,
    discountCents,
    totalCostCents,
    roundingAddedMinutes,
    hasDiscount: discountCents > 0,
  };
}
