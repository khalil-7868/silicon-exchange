export type ReservationStatus = 'held' | 'confirmed' | 'cancelled' | 'expired';

export interface PriceQuote {
  rawDurationMinutes: number;
  roundedDurationMinutes: number;
  billableHours: number;
  baseHours: number;
  excessHours: number;
  hourlyRateCents: number;
  baseCostCents: number;
  excessBeforeDiscountCents: number;
  discountCents: number;
  totalCostCents: number;
  roundingAddedMinutes: number;
  hasDiscount: boolean;
}

export interface Reservation {
  id: string;
  listingId: string;
  listingSlug: string;
  listingName: string;
  chipModel: string;
  startTime: number; // Unix timestamp ms
  endTime: number;   // Unix timestamp ms
  status: ReservationStatus;
  createdAt: number; // Unix timestamp ms
  confirmedAt?: number;
  cancelledAt?: number;
  priceQuote: PriceQuote;
  clientNotes?: string;
}

export interface ReservationCheckResult {
  allowed: boolean;
  reason?: string;
  conflictingReservation?: Reservation;
}
