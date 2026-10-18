'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { RegionId, ListingStatus } from '@/types/listing';
import { REGIONS } from '@/data/regions';
import { SearchIcon, XIcon, FilterIcon } from '@/components/ui/Icons';
import { SortField } from '@/types/filter';

const MEMORY_OPTIONS = [
  { label: 'All VRAM', min: 0, max: 1000 },
  { label: '24 GB - 48 GB', min: 24, max: 48 },
  { label: '80 GB - 96 GB', min: 80, max: 96 },
  { label: '128 GB - 192 GB+', min: 128, max: 1000 },
];

const STATUS_OPTIONS: { label: string; value: ListingStatus | 'all' }[] = [
  { label: 'All States', value: 'all' },
  { label: 'Online Only', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Decommissioned', value: 'retired' },
];

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: 'Hourly Rate: Low to High', value: 'price-asc' },
  { label: 'Hourly Rate: High to Low', value: 'price-desc' },
  { label: 'Memory (VRAM): Highest', value: 'memory-desc' },
  { label: 'Compute (TFLOPS): Highest', value: 'tflops-desc' },
  { label: 'Live Utilization: Highest', value: 'util-desc' },
  { label: 'Live Utilization: Lowest', value: 'util-asc' },
];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get('q') || '';
  const selectedRegions = searchParams.getAll('region') as RegionId[];
  const selectedStatus = (searchParams.get('status') as ListingStatus | 'all') || 'all';
  const selectedSort = (searchParams.get('sort') as SortField) || 'price-asc';
  const currentMinMem = searchParams.get('minMem') ? Number(searchParams.get('minMem')) : 0;
  const currentMaxMem = searchParams.get('maxMem') ? Number(searchParams.get('maxMem')) : 1000;

  // Helper to update query string parameters
  const updateQuery = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuery({ q: e.target.value.trim() ? e.target.value : null });
  };

  const handleRegionToggle = (regionId: RegionId) => {
    const exists = selectedRegions.includes(regionId);
    const newRegions = exists
      ? selectedRegions.filter((r) => r !== regionId)
      : [...selectedRegions, regionId];
    updateQuery({ region: newRegions });
  };

  const handleStatusChange = (status: ListingStatus | 'all') => {
    updateQuery({ status: status === 'all' ? null : status });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuery({ sort: e.target.value as SortField });
  };

  const handleMemoryChange = (min: number, max: number) => {
    if (min === 0 && max === 1000) {
      updateQuery({ minMem: null, maxMem: null });
    } else {
      updateQuery({ minMem: min.toString(), maxMem: max.toString() });
    }
  };

  const resetAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedRegions.length > 0 ||
    selectedStatus !== 'all' ||
    currentMinMem > 0 ||
    currentMaxMem < 1000;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6" aria-label="Filters">
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white">
            <FilterIcon size={14} className="text-cyan-400" />
            <span>GRID FILTERS</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1 focus:outline-none"
            >
              <XIcon size={12} />
              Reset
            </button>
          )}
        </div>

        {/* 1. Search */}
        <div className="space-y-1.5">
          <label htmlFor="grid-search" className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Node Search
          </label>
          <div className="relative">
            <input
              id="grid-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="e.g. H100, RTX, NVLink..."
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 pl-9 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => updateQuery({ q: null })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                aria-label="Clear search input"
              >
                <XIcon size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 2. Sort By */}
        <div className="space-y-1.5">
          <label htmlFor="grid-sort" className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Sort Nodes By
          </label>
          <select
            id="grid-sort"
            value={selectedSort}
            onChange={handleSortChange}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Status Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Node Status
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusChange(opt.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all border text-left flex items-center justify-between ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-semibold'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Memory (VRAM) Range */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            VRAM Capacity
          </label>
          <div className="space-y-1.5">
            {MEMORY_OPTIONS.map((opt) => {
              const active = currentMinMem === opt.min && currentMaxMem === opt.max;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleMemoryChange(opt.min, opt.max)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono tracking-wider text-left transition-all border flex items-center justify-between ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-semibold'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Datacenter Region */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Datacenter Regions
            </label>
            {selectedRegions.length > 0 && (
              <span className="text-[10px] font-mono text-cyan-400">
                {selectedRegions.length} selected
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {Object.values(REGIONS).map((reg) => {
              const checked = selectedRegions.includes(reg.id);
              return (
                <label
                  key={reg.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                    checked
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRegionToggle(reg.id)}
                      className="rounded border-slate-300 dark:border-white/20 bg-transparent text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate">{reg.flag} {reg.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 ml-2">{reg.latencyAvgMs}ms</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
