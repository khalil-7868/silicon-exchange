import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Reservation, ReservationCheckResult } from '@/types/reservation';
import { Listing } from '@/types/listing';
import { INITIAL_PRE_EXISTING_RESERVATIONS } from '@/data/mockReservations';
import { calculatePriceQuote } from '@/lib/pricing';
import {
  canReserveListing,
  isHoldExpired,
} from '@/lib/reservations';

interface ReservationStoreState {
  reservations: Reservation[];
  userReservationIds: string[]; // Track which reservations were created by the user in this session/browser

  // Actions
  createHoldReservation: (
    listing: Listing,
    startTime: number,
    endTime: number,
    clientNotes?: string
  ) => { success: boolean; reservation?: Reservation; error?: string };

  confirmReservation: (reservationId: string) => boolean;
  cancelReservation: (reservationId: string) => boolean;
  expireReservation: (reservationId: string) => void;
  checkAndExpireHolds: () => void;
  getUserReservations: () => Reservation[];
  getUserTotalSpendCents: () => number;
}

export const useReservationStore = create<ReservationStoreState>()(
  persist(
    (set, get) => ({
      reservations: INITIAL_PRE_EXISTING_RESERVATIONS,
      userReservationIds: ['res-pre-05-active-hold'], // Give user ownership of the active hold so they can test it right away!

      createHoldReservation: (listing, startTime, endTime, clientNotes) => {
        const state = get();
        const now = Date.now();

        // 1. Check if reservation is allowed
        const check: ReservationCheckResult = canReserveListing(
          listing,
          startTime,
          endTime,
          state.reservations,
          now
        );

        if (!check.allowed) {
          return { success: false, error: check.reason };
        }

        // 2. Compute quote
        const priceQuote = calculatePriceQuote(
          startTime,
          endTime,
          listing.hourlyRateCents
        );

        // 3. Create held reservation
        const newReservation: Reservation = {
          id: `res-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          listingId: listing.id,
          listingSlug: listing.slug,
          listingName: listing.name,
          chipModel: listing.chip,
          startTime,
          endTime,
          status: 'held',
          createdAt: now,
          priceQuote,
          clientNotes: clientNotes || 'User compute reservation',
        };

        set((prev) => ({
          reservations: [newReservation, ...prev.reservations],
          userReservationIds: [newReservation.id, ...prev.userReservationIds],
        }));

        return { success: true, reservation: newReservation };
      },

      confirmReservation: (reservationId: string) => {
        const now = Date.now();
        let confirmed = false;

        set((prev) => {
          const next = prev.reservations.map((res) => {
            if (res.id === reservationId) {
              if (res.status === 'held') {
                if (isHoldExpired(res, now)) {
                  // Cannot confirm expired hold
                  return { ...res, status: 'expired' as const };
                }
                confirmed = true;
                return {
                  ...res,
                  status: 'confirmed' as const,
                  confirmedAt: now,
                };
              }
            }
            return res;
          });
          return { reservations: next };
        });

        return confirmed;
      },

      cancelReservation: (reservationId: string) => {
        const now = Date.now();
        let cancelled = false;

        set((prev) => {
          const next = prev.reservations.map((res) => {
            if (res.id === reservationId) {
              if (res.status === 'held' || res.status === 'confirmed') {
                cancelled = true;
                return {
                  ...res,
                  status: 'cancelled' as const,
                  cancelledAt: now,
                };
              }
            }
            return res;
          });
          return { reservations: next };
        });

        return cancelled;
      },

      expireReservation: (reservationId: string) => {
        set((prev) => ({
          reservations: prev.reservations.map((res) =>
            res.id === reservationId && res.status === 'held'
              ? { ...res, status: 'expired' as const }
              : res
          ),
        }));
      },

      checkAndExpireHolds: () => {
        const now = Date.now();
        set((prev) => {
          let hasChanges = false;
          const next = prev.reservations.map((res) => {
            if (res.status === 'held' && isHoldExpired(res, now)) {
              hasChanges = true;
              return { ...res, status: 'expired' as const };
            }
            return res;
          });
          return hasChanges ? { reservations: next } : prev;
        });
      },

      getUserReservations: () => {
        const state = get();
        const userSet = new Set(state.userReservationIds);
        return state.reservations.filter((r) => userSet.has(r.id));
      },

      getUserTotalSpendCents: () => {
        const userReservations = get().getUserReservations();
        return userReservations.reduce((sum, res) => {
          if (res.status === 'confirmed' || res.status === 'held') {
            return sum + res.priceQuote.totalCostCents;
          }
          return sum;
        }, 0);
      },
    }),
    {
      name: 'silicon_reservations_store_v1',
      storage: createJSONStorage(() => localStorage),
      // Merge strategy so any new initial mock reservations are preserved while preserving user updates
      merge: (persistedState: unknown, currentState) => {
        const pState = persistedState as { reservations?: Reservation[]; userReservationIds?: string[] } | null;
        if (!pState || !pState.reservations) {
          return currentState;
        }

        const persistedMap = new Map<string, Reservation>(
          pState.reservations.map((r: Reservation) => [r.id, r])
        );

        // Keep mock reservations up-to-date while honoring state overrides
        const merged: Reservation[] = [];
        for (const init of currentState.reservations) {
          if (persistedMap.has(init.id)) {
            merged.push(persistedMap.get(init.id)!);
            persistedMap.delete(init.id);
          } else {
            merged.push(init);
          }
        }
        // Append all user created reservations
        for (const remaining of persistedMap.values()) {
          merged.unshift(remaining);
        }

        return {
          ...currentState,
          reservations: merged,
          userReservationIds: pState.userReservationIds || currentState.userReservationIds,
        };
      },
    }
  )
);
