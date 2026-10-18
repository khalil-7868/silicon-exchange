import React from 'react';

/** Shimmer skeleton placeholder matching the shape of a ListingCard */
export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] overflow-hidden">
      {/* accent line */}
      <div className="h-[2px] skeleton" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-14 rounded" />
        </div>

        {/* title */}
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>

        {/* region pill */}
        <div className="skeleton h-6 w-full rounded-md" />

        {/* spec grid */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 dark:border-white/5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="skeleton h-2.5 w-16 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          ))}
        </div>

        {/* util bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
          <div className="skeleton h-1.5 w-full rounded-full" />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="space-y-1">
            <div className="skeleton h-2.5 w-14 rounded" />
            <div className="skeleton h-5 w-16 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton cards for the browse page Suspense fallback */
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-500">
        <div className="skeleton h-3 w-52 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for the listing detail page */
export function ListingDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 page-enter">
      {/* breadcrumb */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/10 space-y-2">
        <div className="skeleton h-3 w-48 rounded" />
        <div className="skeleton h-8 w-80 rounded" />
        <div className="skeleton h-3 w-64 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* left col */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-6 space-y-6">
            <div className="skeleton h-4 w-48 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
            <div className="skeleton h-32 rounded-xl" />
          </div>
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>

        {/* right col */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="skeleton h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
