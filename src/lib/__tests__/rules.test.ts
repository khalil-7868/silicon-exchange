import { describe, it, expect } from 'vitest';
import { calculatePriceQuote } from '../pricing';
import {
  doTimeRangesOverlap,
  isHoldExpired,
  canReserveListing,
} from '../reservations';
import { filterAndSortListings } from '../filters';
import { Listing } from '@/types/listing';
import { Reservation } from '@/types/reservation';
import { FilterState } from '@/types/filter';

describe('1. Overlap Detection (Half-Open Intervals [start, end))', () => {
  const t = (hour: number, minute: number = 0) =>
    new Date(2026, 9, 18, hour, minute).getTime();

  it('correctly detects non-overlapping disjoint intervals', () => {
    // 10:00-12:00 vs 13:00-15:00
    expect(doTimeRangesOverlap(t(10), t(12), t(13), t(15))).toBe(false);
    expect(doTimeRangesOverlap(t(13), t(15), t(10), t(12))).toBe(false);
  });

  it('correctly handles the half-open boundary: 14:00 end vs 14:00 start do NOT overlap', () => {
    // Res A: 12:00 - 14:00
    // Res B: 14:00 - 16:00
    // [12:00, 14:00) and [14:00, 16:00)
    expect(doTimeRangesOverlap(t(12), t(14), t(14), t(16))).toBe(false);
    expect(doTimeRangesOverlap(t(14), t(16), t(12), t(14))).toBe(false);
  });

  it('correctly detects genuine overlaps', () => {
    // Partial overlap: 12:00-14:30 vs 14:00-16:00
    expect(doTimeRangesOverlap(t(12), t(14, 30), t(14), t(16))).toBe(true);
    // Complete containment: 12:00-16:00 vs 13:00-14:00
    expect(doTimeRangesOverlap(t(12), t(16), t(13), t(14))).toBe(true);
    // Identical intervals: 14:00-16:00 vs 14:00-16:00
    expect(doTimeRangesOverlap(t(14), t(16), t(14), t(16))).toBe(true);
    // 1ms overlap: 13:59:59.999 vs 14:00:00.000
    expect(doTimeRangesOverlap(1000, 2001, 2000, 3000)).toBe(true);
  });

  it('ignores cancelled reservations and allows booking the freed slot', () => {
    const listing = { id: 'node-01', status: 'available' as const };
    const now = t(10);
    const cancelledReservation: Reservation = {
      id: 'res-cancelled',
      listingId: 'node-01',
      listingSlug: 'h100-va',
      listingName: 'NVIDIA H100',
      chipModel: 'NVIDIA H100 SXM5',
      startTime: t(14),
      endTime: t(16),
      status: 'cancelled',
      createdAt: t(8),
      cancelledAt: t(9),
      priceQuote: calculatePriceQuote(t(14), t(16), 300),
    };

    const result = canReserveListing(
      listing,
      t(14),
      t(16),
      [cancelledReservation],
      now
    );
    expect(result.allowed).toBe(true);
  });

  it('ignores expired holds and allows booking the freed slot', () => {
    const listing = { id: 'node-01', status: 'available' as const };
    const createdAt = t(10, 0);
    const currentTime = t(10, 11); // 11 minutes later -> hold expired!

    const expiredHeldReservation: Reservation = {
      id: 'res-held-expired',
      listingId: 'node-01',
      listingSlug: 'h100-va',
      listingName: 'NVIDIA H100',
      chipModel: 'NVIDIA H100 SXM5',
      startTime: t(14),
      endTime: t(16),
      status: 'held',
      createdAt: createdAt,
      priceQuote: calculatePriceQuote(t(14), t(16), 300),
    };

    const result = canReserveListing(
      listing,
      t(14),
      t(16),
      [expiredHeldReservation],
      currentTime
    );
    expect(result.allowed).toBe(true);
  });

  it('blocks booking when overlapping an active unexpired hold or confirmed reservation', () => {
    const listing = { id: 'node-01', status: 'available' as const };
    const now = t(10, 5); // 5 minutes after creation -> still valid hold

    const activeHeldReservation: Reservation = {
      id: 'res-held-active',
      listingId: 'node-01',
      listingSlug: 'h100-va',
      listingName: 'NVIDIA H100',
      chipModel: 'NVIDIA H100 SXM5',
      startTime: t(14),
      endTime: t(16),
      status: 'held',
      createdAt: t(10, 0),
      priceQuote: calculatePriceQuote(t(14), t(16), 300),
    };

    const result = canReserveListing(
      listing,
      t(15),
      t(17),
      [activeHeldReservation],
      now
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('overlaps with an existing held reservation');
  });

  it('maintenance blocks new reservations completely', () => {
    const maintenanceListing = { id: 'node-maint', status: 'maintenance' as const };
    const result = canReserveListing(
      maintenanceListing,
      t(14),
      t(16),
      [],
      t(10)
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('maintenance');
  });
});

describe('2. Pricing Rules (15-min round-up, 1h minimum, >24h 10% discount, integer cents)', () => {
  const start = 1700000000000;
  const minute = 60 * 1000;
  const hour = 60 * minute;

  it('applies the 1-hour minimum billable block for short durations', () => {
    const rateCents = 250; // $2.50/hr
    // 15 minutes requested
    const q15 = calculatePriceQuote(start, start + 15 * minute, rateCents);
    expect(q15.rawDurationMinutes).toBe(15);
    expect(q15.roundedDurationMinutes).toBe(60);
    expect(q15.billableHours).toBe(1.0);
    expect(q15.totalCostCents).toBe(250);

    // 45 minutes requested
    const q45 = calculatePriceQuote(start, start + 45 * minute, rateCents);
    expect(q45.rawDurationMinutes).toBe(45);
    expect(q45.roundedDurationMinutes).toBe(60);
    expect(q45.billableHours).toBe(1.0);
    expect(q45.totalCostCents).toBe(250);
  });

  it('rounds up in 15-minute increments for bookings > 1 hour', () => {
    const rateCents = 400; // $4.00/hr

    // 60 minutes -> 60 minutes (1.0h)
    const q60 = calculatePriceQuote(start, start + 60 * minute, rateCents);
    expect(q60.roundedDurationMinutes).toBe(60);
    expect(q60.billableHours).toBe(1.0);
    expect(q60.totalCostCents).toBe(400);

    // 61 minutes -> 75 minutes (1.25h)
    const q61 = calculatePriceQuote(start, start + 61 * minute, rateCents);
    expect(q61.roundedDurationMinutes).toBe(75);
    expect(q61.billableHours).toBe(1.25);
    expect(q61.roundingAddedMinutes).toBe(14);
    expect(q61.totalCostCents).toBe(500); // 1.25 * 400 = 500 cents ($5.00)

    // 75 minutes -> 75 minutes (1.25h)
    const q75 = calculatePriceQuote(start, start + 75 * minute, rateCents);
    expect(q75.roundedDurationMinutes).toBe(75);
    expect(q75.billableHours).toBe(1.25);
    expect(q75.roundingAddedMinutes).toBe(0);
    expect(q75.totalCostCents).toBe(500);

    // 76 minutes -> 90 minutes (1.5h)
    const q76 = calculatePriceQuote(start, start + 76 * minute, rateCents);
    expect(q76.roundedDurationMinutes).toBe(90);
    expect(q76.billableHours).toBe(1.5);
    expect(q76.totalCostCents).toBe(600); // 1.5 * 400 = 600 cents
  });

  it('does NOT apply discount on bookings up to 24 hours', () => {
    const rateCents = 300; // $3.00/hr
    const q24 = calculatePriceQuote(start, start + 24 * hour, rateCents);
    expect(q24.billableHours).toBe(24);
    expect(q24.baseHours).toBe(24);
    expect(q24.excessHours).toBe(0);
    expect(q24.discountCents).toBe(0);
    expect(q24.hasDiscount).toBe(false);
    expect(q24.totalCostCents).toBe(7200); // 24 * 300 = 7,200 cents ($72.00)
  });

  it('applies 10% discount ONLY to the excess hours beyond the 24th hour', () => {
    const rateCents = 300; // $3.00/hr

    // 26 hours total:
    // Base: 24h * 300 = 7200 cents ($72.00)
    // Excess: 2h * 300 = 600 cents ($6.00)
    // Discount: 10% of 600 = 60 cents
    // Excess cost: 600 - 60 = 540 cents
    // Total: 7200 + 540 = 7740 cents ($77.40)
    // (If discount had wrongly applied to whole booking, it would be 26 * 300 * 0.9 = 7020 cents)
    const q26 = calculatePriceQuote(start, start + 26 * hour, rateCents);
    expect(q26.billableHours).toBe(26);
    expect(q26.baseHours).toBe(24);
    expect(q26.excessHours).toBe(2);
    expect(q26.baseCostCents).toBe(7200);
    expect(q26.excessBeforeDiscountCents).toBe(600);
    expect(q26.discountCents).toBe(60);
    expect(q26.hasDiscount).toBe(true);
    expect(q26.totalCostCents).toBe(7740);

    // 30 hours at 450 cents/hr ($4.50/hr):
    // Base: 24h * 450 = 10,800 cents
    // Excess: 6h * 450 = 2,700 cents
    // Discount: 10% of 2700 = 270 cents
    // Excess cost: 2430 cents
    // Total: 10800 + 2430 = 13230 cents ($132.30)
    const q30 = calculatePriceQuote(start, start + 30 * hour, 450);
    expect(q30.baseCostCents).toBe(10800);
    expect(q30.discountCents).toBe(270);
    expect(q30.totalCostCents).toBe(13230);
  });

  it('computes integer cents with fractional hours beyond 24h with 15m round-up', () => {
    const rateCents = 200; // $2.00/hr
    // 24 hours and 5 minutes -> rounded up to 24 hours 15 minutes (24.25 hours)
    const q24_5m = calculatePriceQuote(start, start + 24 * hour + 5 * minute, rateCents);
    expect(q24_5m.billableHours).toBe(24.25);
    expect(q24_5m.baseHours).toBe(24);
    expect(q24_5m.excessHours).toBe(0.25);
    expect(q24_5m.baseCostCents).toBe(4800);
    // 0.25 * 200 = 50 cents. 10% of 50 = 5 cents.
    expect(q24_5m.excessBeforeDiscountCents).toBe(50);
    expect(q24_5m.discountCents).toBe(5);
    expect(q24_5m.totalCostCents).toBe(4845); // 4800 + (50 - 5) = 4845 cents
    expect(Number.isInteger(q24_5m.totalCostCents)).toBe(true);
  });
});

describe('3. Hold Expiry at the 10-Minute Boundary', () => {
  const baseTime = 1700000000000;

  it('is NOT expired at 9 minutes 59 seconds (599,000 ms)', () => {
    const res = { status: 'held' as const, createdAt: baseTime };
    const nineMin59Sec = baseTime + 9 * 60 * 1000 + 59 * 1000;
    expect(isHoldExpired(res, nineMin59Sec)).toBe(false);
  });

  it('IS expired at exactly 10 minutes (600,000 ms)', () => {
    const res = { status: 'held' as const, createdAt: baseTime };
    const tenMin = baseTime + 10 * 60 * 1000;
    expect(isHoldExpired(res, tenMin)).toBe(true);
  });

  it('IS expired after 10 minutes and 1 second (601,000 ms)', () => {
    const res = { status: 'held' as const, createdAt: baseTime };
    const tenMin1Sec = baseTime + 10 * 60 * 1000 + 1000;
    expect(isHoldExpired(res, tenMin1Sec)).toBe(true);
  });

  it('confirmed reservations never expire via hold timer', () => {
    const res = { status: 'confirmed' as const, createdAt: baseTime };
    const oneDayLater = baseTime + 24 * 60 * 60 * 1000;
    expect(isHoldExpired(res, oneDayLater)).toBe(false);
  });
});

describe('4. Filter and Sort Reducer', () => {
  const mockListings: Listing[] = [
    {
      id: 'h100-va',
      slug: 'h100-va',
      name: 'NVIDIA H100 SXM5 80GB Node 1',
      chip: 'NVIDIA H100 SXM5',
      architecture: 'Hopper GH100',
      memoryGb: 80,
      memoryType: 'HBM3',
      memoryBandwidthGbps: 3350,
      tflops: 1979,
      hourlyRateCents: 280,
      status: 'available',
      region: 'us-east-va',
      pciGen: 'NVLink 4.0 (900 GB/s)',
      hostCpu: 'AMD EPYC 9654',
      hostRamGb: 512,
      storageNvmeGb: 3840,
      tdpWatts: 700,
      provider: {
        name: 'Equinix Metal Ashburn',
        tier: 'Tier IV',
        uptime90d: 99.99,
        renewableEnergy: true,
      },
      currentUtilization: 42,
      currentPowerWatts: 340,
      utilizationSamples: [],
      tags: ['LLM Training', 'SXM5', 'FP8 Transformer Engine'],
    },
    {
      id: 'rtx5090-or',
      slug: 'rtx5090-or',
      name: 'NVIDIA RTX 5090 32GB Node 2',
      chip: 'NVIDIA RTX 5090',
      architecture: 'Blackwell GB202',
      memoryGb: 32,
      memoryType: 'GDDR7',
      memoryBandwidthGbps: 1792,
      tflops: 1650,
      hourlyRateCents: 110,
      status: 'available',
      region: 'us-west-or',
      pciGen: 'PCIe 5.0 x16',
      hostCpu: 'Intel Xeon Platinum 8580',
      hostRamGb: 256,
      storageNvmeGb: 1920,
      tdpWatts: 600,
      provider: {
        name: 'Cascade Compute Hillsboro',
        tier: 'Tier III',
        uptime90d: 99.95,
        renewableEnergy: true,
      },
      currentUtilization: 88,
      currentPowerWatts: 510,
      utilizationSamples: [],
      tags: ['Diffusion Models', 'Fine-Tuning', 'GDDR7'],
    },
    {
      id: 'mi300x-de',
      slug: 'mi300x-de',
      name: 'AMD Instinct MI300X 192GB Node 3',
      chip: 'AMD Instinct MI300X',
      architecture: 'CDNA 3',
      memoryGb: 192,
      memoryType: 'HBM3',
      memoryBandwidthGbps: 5300,
      tflops: 2614,
      hourlyRateCents: 340,
      status: 'maintenance',
      region: 'eu-central-de',
      pciGen: 'Ultra Accelerator Link',
      hostCpu: 'AMD EPYC 9754',
      hostRamGb: 768,
      storageNvmeGb: 7680,
      tdpWatts: 750,
      provider: {
        name: 'Telehouse Frankfurt',
        tier: 'Tier IV',
        uptime90d: 99.98,
        renewableEnergy: true,
      },
      currentUtilization: 12,
      currentPowerWatts: 180,
      utilizationSamples: [],
      tags: ['192GB HBM3', '70B Single-Node', 'ROCm 6.2'],
    },
    {
      id: 'm3ultra-jp',
      slug: 'm3ultra-jp',
      name: 'Apple M3 Ultra 128GB Node 4',
      chip: 'Apple M3 Ultra',
      architecture: 'Apple Silicon',
      memoryGb: 128,
      memoryType: 'Unified LPDDR5X',
      memoryBandwidthGbps: 800,
      tflops: 650,
      hourlyRateCents: 95,
      status: 'retired',
      region: 'ap-northeast-jp',
      pciGen: 'Unified Fabric',
      hostCpu: 'Apple M3 Ultra 28-Core',
      hostRamGb: 128,
      storageNvmeGb: 2000,
      tdpWatts: 150,
      provider: {
        name: 'NTT Tokyo Data Center',
        tier: 'Tier IV',
        uptime90d: 99.99,
        renewableEnergy: false,
      },
      currentUtilization: 0,
      currentPowerWatts: 30,
      utilizationSamples: [],
      tags: ['Unified Memory', 'Metal Performance Shaders'],
    },
  ];

  it('filters by combined query: status + minMemory + region + search', () => {
    const filters: FilterState = {
      search: 'H100',
      regions: ['us-east-va'],
      minMemory: 40,
      maxMemory: 200,
      status: 'available',
      sort: 'price-asc',
      chips: [],
    };

    const results = filterAndSortListings(mockListings, filters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('h100-va');
  });

  it('correctly filters out maintenance and retired nodes when status is available', () => {
    const filters: FilterState = {
      search: '',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'available',
      sort: 'price-asc',
      chips: [],
    };

    const results = filterAndSortListings(mockListings, filters);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual(['rtx5090-or', 'h100-va']);
  });

  it('sorts properly by price-desc, memory-desc, tflops-desc, and util-desc', () => {
    // Sort by price-desc
    const byPriceDesc = filterAndSortListings(mockListings, {
      search: '',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'all',
      sort: 'price-desc',
      chips: [],
    });
    expect(byPriceDesc.map((r) => r.hourlyRateCents)).toEqual([340, 280, 110, 95]);

    // Sort by memory-desc
    const byMemDesc = filterAndSortListings(mockListings, {
      search: '',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'all',
      sort: 'memory-desc',
      chips: [],
    });
    expect(byMemDesc.map((r) => r.memoryGb)).toEqual([192, 128, 80, 32]);

    // Sort by tflops-desc
    const byTflopsDesc = filterAndSortListings(mockListings, {
      search: '',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'all',
      sort: 'tflops-desc',
      chips: [],
    });
    expect(byTflopsDesc.map((r) => r.tflops)).toEqual([2614, 1979, 1650, 650]);

    // Sort by util-desc
    const byUtilDesc = filterAndSortListings(mockListings, {
      search: '',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'all',
      sort: 'util-desc',
      chips: [],
    });
    expect(byUtilDesc.map((r) => r.currentUtilization)).toEqual([88, 42, 12, 0]);
  });

  it('returns empty array when filters match nothing', () => {
    const filters: FilterState = {
      search: 'nonexistent-quantum-chip',
      regions: [],
      minMemory: 0,
      maxMemory: 500,
      status: 'all',
      sort: 'price-asc',
      chips: [],
    };

    const results = filterAndSortListings(mockListings, filters);
    expect(results).toHaveLength(0);
  });
});
