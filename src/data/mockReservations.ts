import { Reservation } from '@/types/reservation';
import { calculatePriceQuote } from '@/lib/pricing';
import { ANCHOR_TIMESTAMP } from './mockListings';

// Base reference time aligned with user's current environment or anchor
const HOUR_MS = 60 * 60 * 1000;

export const INITIAL_PRE_EXISTING_RESERVATIONS: Reservation[] = [
  // 1. Confirmed reservation on node-01 (NVIDIA H100 SXM5 Ashburn)
  // 10:00 to 14:00 UTC (4 hours)
  {
    id: 'res-pre-01',
    listingId: 'node-01',
    listingSlug: 'h100-sxm5-ashburn-01',
    listingName: 'NVIDIA H100 SXM5 80GB (Ashburn-A1)',
    chipModel: 'NVIDIA H100 SXM5',
    startTime: ANCHOR_TIMESTAMP + 12 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 16 * HOUR_MS,
    status: 'confirmed',
    createdAt: ANCHOR_TIMESTAMP - 5 * HOUR_MS,
    confirmedAt: ANCHOR_TIMESTAMP - 4 * HOUR_MS,
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 12 * HOUR_MS,
      ANCHOR_TIMESTAMP + 16 * HOUR_MS,
      280
    ),
    clientNotes: 'Distributed Llama 3 70B fine-tuning checkpoint run',
  },

  // 2. Adjacent reservation on node-01 (16:00 to 20:00)
  // NAIVE OVERLAP BOUNDARY TRAP:
  // If a renter requests [16:00, 20:00), it touches res-pre-01 at 16:00 exactly.
  // Half-open interval rules state they do NOT overlap.
  {
    id: 'res-pre-02',
    listingId: 'node-01',
    listingSlug: 'h100-sxm5-ashburn-01',
    listingName: 'NVIDIA H100 SXM5 80GB (Ashburn-A1)',
    chipModel: 'NVIDIA H100 SXM5',
    startTime: ANCHOR_TIMESTAMP + 16 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 20 * HOUR_MS,
    status: 'confirmed',
    createdAt: ANCHOR_TIMESTAMP - 6 * HOUR_MS,
    confirmedAt: ANCHOR_TIMESTAMP - 5 * HOUR_MS,
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 16 * HOUR_MS,
      ANCHOR_TIMESTAMP + 20 * HOUR_MS,
      280
    ),
    clientNotes: 'Batch embedding generation for vector index',
  },

  // 3. CANCELLED reservation on node-04 (RTX 5090 Hillsboro)
  // NAIVE OVERLAP TRAP:
  // Naive check without status filtering would wrongly block any user attempting
  // to book this 14:00 - 18:00 slot, even though it was cancelled by the previous user.
  {
    id: 'res-pre-03-cancelled',
    listingId: 'node-04',
    listingSlug: 'rtx5090-hillsboro-04',
    listingName: 'NVIDIA RTX 5090 32GB (Oregon-Hydro-01)',
    chipModel: 'NVIDIA RTX 5090',
    startTime: ANCHOR_TIMESTAMP + 8 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 14 * HOUR_MS,
    status: 'cancelled',
    createdAt: ANCHOR_TIMESTAMP - 10 * HOUR_MS,
    cancelledAt: ANCHOR_TIMESTAMP - 2 * HOUR_MS,
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 8 * HOUR_MS,
      ANCHOR_TIMESTAMP + 14 * HOUR_MS,
      120
    ),
    clientNotes: 'Run cancelled due to dataset schema change',
  },

  // 4. EXPIRED HOLD on node-04 (RTX 5090 Hillsboro)
  // NAIVE OVERLAP TRAP:
  // A held reservation created 45 minutes ago that was never confirmed.
  // Naive overlap check that simply matches status == 'held' without time calculation
  // would wrongly lock the slot. Pure rules correctly treat it as expired and freed!
  {
    id: 'res-pre-04-expired-hold',
    listingId: 'node-04',
    listingSlug: 'rtx5090-hillsboro-04',
    listingName: 'NVIDIA RTX 5090 32GB (Oregon-Hydro-01)',
    chipModel: 'NVIDIA RTX 5090',
    startTime: ANCHOR_TIMESTAMP + 18 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 22 * HOUR_MS,
    status: 'held',
    createdAt: ANCHOR_TIMESTAMP - 45 * 60 * 1000, // 45 minutes ago (> 10m threshold!)
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 18 * HOUR_MS,
      ANCHOR_TIMESTAMP + 22 * HOUR_MS,
      120
    ),
    clientNotes: 'Unconfirmed checkout session abandoned by browser close',
  },

  // 5. ACTIVE LIVE HOLD on node-06 (AMD Instinct MI300X Frankfurt)
  // Held only 3 minutes ago (has 7 minutes left on countdown timer!)
  {
    id: 'res-pre-05-active-hold',
    listingId: 'node-06',
    listingSlug: 'mi300x-frankfurt-06',
    listingName: 'AMD Instinct MI300X 192GB (Frankfurt-CDNA3-01)',
    chipModel: 'AMD Instinct MI300X',
    startTime: ANCHOR_TIMESTAMP + 24 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 36 * HOUR_MS,
    status: 'held',
    createdAt: ANCHOR_TIMESTAMP - 3 * 60 * 1000,
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 24 * HOUR_MS,
      ANCHOR_TIMESTAMP + 36 * HOUR_MS,
      340
    ),
    clientNotes: 'DeepSeek R1 distilled evaluation block',
  },

  // 6. Confirmed reservation on node-21 (H100 SXM5 Frankfurt - currently under maintenance)
  // Confirmed reservation remains intact despite node entering maintenance
  {
    id: 'res-pre-06-maintenance-intact',
    listingId: 'node-21',
    listingSlug: 'h100-sxm5-frankfurt-21',
    listingName: 'NVIDIA H100 SXM5 80GB (Frankfurt-Maint-01)',
    chipModel: 'NVIDIA H100 SXM5',
    startTime: ANCHOR_TIMESTAMP + 72 * HOUR_MS,
    endTime: ANCHOR_TIMESTAMP + 96 * HOUR_MS,
    status: 'confirmed',
    createdAt: ANCHOR_TIMESTAMP - 48 * HOUR_MS,
    confirmedAt: ANCHOR_TIMESTAMP - 47 * HOUR_MS,
    priceQuote: calculatePriceQuote(
      ANCHOR_TIMESTAMP + 72 * HOUR_MS,
      ANCHOR_TIMESTAMP + 96 * HOUR_MS,
      290
    ),
    clientNotes: 'Post-maintenance benchmark reservation verified by host',
  },
];
