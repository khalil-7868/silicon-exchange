import React, { Suspense } from 'react';
import { MOCK_LISTINGS } from '@/data/mockListings';
import { FilterSidebar } from '@/components/listings/FilterSidebar';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { ServerRackIcon } from '@/components/ui/Icons';
import { ListingGridSkeleton } from '@/components/ui/Skeletons';

export const metadata = {
  title: 'Accelerator Grid // SILICON EXCHANGE',
  description: 'Browse, filter, and inspect bare-metal GPU and AI accelerator nodes with live telemetry and transparent spot pricing.',
};

export default function BrowsePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            <ServerRackIcon size={14} />
            <span>GLOBAL BARE-METAL INFRASTRUCTURE</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase mt-1">
            Accelerator Compute Grid
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Real-time telemetry, 15m spot pricing, and guaranteed half-open slot reservations.
          </p>
        </div>
      </div>

      {/* Main Browse Layout with Suspense for URL Search Param Synchronization */}
      <Suspense
        fallback={
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* sidebar skeleton */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
              <div className="skeleton h-8 w-full rounded-lg" />
              <div className="skeleton h-32 w-full rounded-lg" />
              <div className="skeleton h-24 w-full rounded-lg" />
            </div>
            <ListingGridSkeleton count={9} />
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar />
          <ListingGrid initialListings={MOCK_LISTINGS} />
        </div>
      </Suspense>
    </div>
  );
}
