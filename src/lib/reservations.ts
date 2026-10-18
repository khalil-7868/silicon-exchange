import { Reservation, ReservationCheckResult, ReservationStatus } from '@/types/reservation';
import { ListingStatus } from '@/types/listing';

export const HOLD_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Checks if two half-open time intervals [startA, endA) and [startB, endB) overlap.
 *
 * Half-open property:
 * If interval A ends at 14:00 (endA = 14:00) and interval B starts at 14:00 (startB = 14:00),
 * startA < endB is true, but endA > startB is false (14:00 > 14:00 is false).
 * Therefore they do NOT overlap.
 */
export function doTimeRangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  if (endA <= startA || endB <= startB) {
    return false;
  }
  return startA < endB && endA > startB;
}

/**
 * Determines whether a held reservation has expired.
 * A hold expires if more than 10 minutes (600,000ms) have passed since createdAt
 * and the reservation has not been confirmed or cancelled.
 */
export function isHoldExpired(
  reservation: { status: ReservationStatus; createdAt: number },
  currentTime: number,
  holdDurationMs: number = HOLD_EXPIRY_MS
): boolean {
  if (reservation.status !== 'held') {
    return false;
  }
  return currentTime - reservation.createdAt >= holdDurationMs;
}

/**
 * Returns whether a reservation should actively occupy a slot on a listing.
 * - Cancelled reservations DO NOT occupy a slot.
 * - Expired reservations DO NOT occupy a slot.
 * - Held reservations only occupy a slot if they have not yet expired (< 10 minutes old).
 * - Confirmed reservations always occupy their time block.
 */
export function isReservationOccupyingSlot(
  reservation: Reservation,
  currentTime: number,
  holdDurationMs: number = HOLD_EXPIRY_MS
): boolean {
  if (reservation.status === 'cancelled' || reservation.status === 'expired') {
    return false;
  }
  if (reservation.status === 'held') {
    return !isHoldExpired(reservation, currentTime, holdDurationMs);
  }
  return reservation.status === 'confirmed';
}

/**
 * Pure function to validate if a listing can accept a new reservation for [startMs, endMs).
 *
 * Rules:
 * 1. Maintenance blocks new reservations completely.
 * 2. Retired listings cannot accept reservations.
 * 3. Range must be valid (endMs > startMs).
 * 4. Cannot overlap any active (confirmed or valid held) reservation for the same listing.
 * 5. Adjacent reservations (e.g. 14:00-15:00 and 15:00-16:00) DO NOT overlap.
 * 6. Cancelled reservations and expired holds are ignored.
 */
export function canReserveListing(
  listing: { id: string; status: ListingStatus; name?: string },
  startMs: number,
  endMs: number,
  existingReservations: Reservation[],
  currentTime: number,
  ignoreReservationId?: string
): ReservationCheckResult {
  if (endMs <= startMs) {
    return {
      allowed: false,
      reason: 'Reservation end time must be after start time',
    };
  }

  // Maintenance blocks new reservations
  if (listing.status === 'maintenance') {
    return {
      allowed: false,
      reason: 'This accelerator is currently in scheduled maintenance. New reservations are blocked.',
    };
  }

  if (listing.status === 'retired') {
    return {
      allowed: false,
      reason: 'This accelerator has been decommissioned and cannot be reserved.',
    };
  }

  // Filter reservations for this specific listing
  const listingReservations = existingReservations.filter(
    (r) => r.listingId === listing.id && r.id !== ignoreReservationId
  );

  for (const res of listingReservations) {
    if (!isReservationOccupyingSlot(res, currentTime)) {
      continue;
    }

    if (doTimeRangesOverlap(startMs, endMs, res.startTime, res.endTime)) {
      return {
        allowed: false,
        reason: `Time slot overlaps with an existing ${res.status} reservation (${new Date(
          res.startTime
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(
          res.endTime
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        conflictingReservation: res,
      };
    }
  }

  return { allowed: true };
}
