'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Listing, RegionId, ListingStatus } from '@/types/listing';
import { ListingCard } from './ListingCard';
import { filterAndSortListings } from '@/lib/filters';
import { FilterState, SortField } from '@/types/filter';
import { ServerRackIcon, XIcon } from '@/components/ui/Icons';

interface ListingGridProps {
  initialListings: Listing[];
}

export function ListingGrid({ initialListings }: ListingGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract filter state from URL search params
  const filters: FilterState = useMemo(() => {
    return {
      search: searchParams.get('q') || '',
      regions: (searchParams.getAll('region') as RegionId[]) || [],
      minMemory: searchParams.get('minMem') ? Number(searchParams.get('minMem')) : 0,
      maxMemory: searchParams.get('maxMem') ? Number(searchParams.get('maxMem')) : 1000,
      status: (searchParams.get('status') as ListingStatus | 'all') || 'all',
      sort: (searchParams.get('sort') as SortField) || 'price-asc',
      chips: [],
    };
  }, [searchParams]);

  // Compute filtered & sorted listings using pure tested function
  const filteredListings = useMemo(() => {
    return filterAndSortListings(initialListings, filters);
  }, [initialListings, filters]);

  const handleClearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="flex-1 space-y-4 page-enter">
      {/* Active Results Summary bar */}
      <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-500">
        <div>
          SHOWING <span className="text-slate-900 dark:text-cyan-400 font-bold">{filteredListings.length}</span> OF {initialListings.length} ACCELERATORS
        </div>
        {filteredListings.length !== initialListings.length && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <XIcon size={12} />
            Reset Filters
          </button>
        )}
      </div>

      {filteredListings.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-[#0B0E17]/50 p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400">
            <ServerRackIcon size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              NO MATCHING ACCELERATORS FOUND
            </h3>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              No bare-metal nodes meet the specified criteria. Try clearing search keywords or expanding VRAM and region constraints.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Listing Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
